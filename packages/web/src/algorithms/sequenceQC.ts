import type { Base, QCDiagnostics, QCResult, ClusteredSNPs } from './run'

const TooHighDivergence = 'too high divergence'
const ClusteredSNPsFlag = 'clustered SNPs'
const TooManyMixedSites = 'Too many non-ACGT characters'
const MissingData = 'missing data'

const knownClusters = new Set([28881, 28882, 28883])

function findSNPClusters(mutations: Record<string, Base>) {
  const windowSize = 100 // window along the genome to look for a cluster
  const clusterCutOff = 6 // number of mutations within that window to trigger a cluster

  // turn mutation keys into positions, exclude known clusters, and sort
  const positions = Object.keys(mutations)
    .map((pos) => Number.parseInt(pos, 10))
    .filter((pos) => !knownClusters.has(pos))
    .sort((a, b) => a - b)

  // loop over all mutations and count how many fall into the clusters
  let previousPos = -1
  const currentCluster: number[] = []
  const allClusters: number[][] = []
  positions.forEach((pos) => {
    currentCluster.push(pos)
    while (currentCluster[0] < pos - windowSize) {
      currentCluster.shift()
    }
    if (currentCluster.length > clusterCutOff) {
      // if the cluster grows uninterrupted, add to the previous cluster
      if (
        allClusters.length > 0 &&
        currentCluster.length > 1 &&
        allClusters[allClusters.length - 1][allClusters[allClusters.length - 1].length - 1] === previousPos
      ) {
        allClusters[allClusters.length - 1].push(pos)
      } else {
        // add a new cluster
        allClusters.push(currentCluster.map((d) => d))
      }
    }
    previousPos = pos
  })

  return allClusters
}

function getNucleotideComposition(alignedQuery: string): Record<string, number> {
  const result: Record<string, number> = {}
  let char = ''
  for (let i = 0; i < alignedQuery.length; i++) {
    char = alignedQuery[i]
    if (result[char] === undefined) {
      result[char] = 1
    } else {
      result[char]++
    }
  }
  return result
}


export function sequenceQC(
  mutations: Record<string, Base>,
  insertions: Record<string, Base>,
  deletions: Record<string, number>,
  alignedQuery: string,
): QCResult {
  const divergenceThreshold = 15
  const mixedSitesThreshold = 10
  const missingDataThreshold = 1000
  const flags: string[] = []

  const totalNumberOfMutations =
    Object.keys(mutations).length + Object.keys(insertions).length + Object.keys(deletions).length

  if (totalNumberOfMutations > divergenceThreshold) {
    flags.push(TooHighDivergence)
  }

  const snpClusters = findSNPClusters(mutations)
  const clusteredSNPs: ClusteredSNPs[] = []
  if (snpClusters.length > 0) {
    snpClusters.forEach((cluster) => {
      clusteredSNPs.push({
        start: cluster[0],
        end: cluster[cluster.length - 1],
        numberOfSNPs: cluster.length,
      })
    })
    flags.push(ClusteredSNPsFlag)
  }
  const nucleotideComposition = getNucleotideComposition(alignedQuery)
  const goodBases = new Set(['A', 'C', 'G', 'T', 'N', '-'])
  const totalMixedSites = Object.keys(nucleotideComposition)
    .filter((d) => !goodBases.has(d))
    .reduce((a, b) => a + nucleotideComposition[b], 0)
  if (totalMixedSites > mixedSitesThreshold) {
    flags.push(TooManyMixedSites)
  }

  if (nucleotideComposition.N && nucleotideComposition.N > missingDataThreshold) {
    flags.push(MissingData)
  }

  const diagnostics: QCDiagnostics = { clusteredSNPs, totalMixedSites, totalNumberOfMutations }
  return { flags, diagnostics, nucleotideComposition }
}