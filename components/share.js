import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Overlay from 'react-bootstrap/Overlay'
import PropTypes from 'prop-types'
import React, {useCallback, useRef, useState} from 'react'
import Tooltip from 'react-bootstrap/Tooltip'

const Share = ({loans, income}) => {
  const [showCopied, setShowCopied] = useState(false)
  const copyRef = useRef(null)
  const linkRef = useRef(null)
  const onCopy = useCallback(() => {
    const {current} = linkRef
    current.focus()
    current.select()
    document.execCommand('copy')

    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 1500)
  }, [linkRef])

  return (
    <Form>
      <Form.Row>
        <Col>
          <Form.Group>
            <Form.Label>
              Copy the link below to easily bookmark or share your entered
              information
            </Form.Label>
            <InputGroup>
              <Form.Control
                ref={linkRef}
                type="text"
                value={`${location.origin}/?c=${btoa(
                  JSON.stringify({loans, income})
                )}`}
              />
              <InputGroup.Append>
                <Button onClick={onCopy} variant="secondary" ref={copyRef}>
                  Copy
                </Button>
                <Overlay
                  target={copyRef.current}
                  show={showCopied}
                  placement="top">
                  {props => (
                    <Tooltip id="overlay-copy" {...props}>
                      Copied!
                    </Tooltip>
                  )}
                </Overlay>
              </InputGroup.Append>
            </InputGroup>
          </Form.Group>
        </Col>
      </Form.Row>
    </Form>
  )
}

Share.propTypes = {
  loans: PropTypes.array,
  income: PropTypes.object
}

export default Share
