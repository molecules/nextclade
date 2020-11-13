import styled from 'styled-components'

import { Card as ReactstrapCard, CardHeader as ReactstrapCardHeader, CardBody as ReactstrapCardBody } from 'reactstrap'

/* Level 1 */
export const CardL1 = styled(ReactstrapCard)`
  border-image: none;
  margin: 10px 5px;
`

export const CardL1Header = styled(ReactstrapCardHeader)`
  background-color: #666;
  //border-bottom: #ccc 1px solid;
  color: #ddd;
  font-weight: bold;
  font-size: 1.25rem;
  padding: 7px 5px;
`

export const CardL1Body = styled(ReactstrapCardBody)`
  margin: 3px 2px;
  padding: 6px;
`

/* Level 2 */
export const CardL2 = styled(ReactstrapCard)`
  margin: 5px;
  box-shadow: none;
  border-image: none;
  border: #dfe2e6 1px solid;
`

export const CardL2Header = styled(ReactstrapCardHeader)`
  font-weight: bold;
  font-size: 1.1rem;
  padding: 7px 5px;
`

export const CardL2Body = styled(ReactstrapCardBody)`
  margin: 3px 2px;
  padding: 5px;
  min-height: 180px;
`
