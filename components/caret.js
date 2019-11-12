import PropTypes from 'prop-types'
import styled from 'styled-components'

const Caret = styled.div`
  display: inline-block;
  margin-left: 0.255em;
  vertical-align: 0.255em;
  content: '';
  border-left: 0.3em solid transparent;
  border-right: 0.3em solid transparent;
  border-top: ${props => (props.dir === 'up' ? '0.3em solid' : 0)};
  border-bottom: ${props => (props.dir === 'down' ? '0.3em solid' : 0)};
`

Caret.propTypes = {
  dir: PropTypes.string
}

export default Caret
