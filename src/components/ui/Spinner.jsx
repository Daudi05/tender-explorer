import './Spinner.css'

export const Spinner = ({ size = 'md', className = '' }) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} className={className}>
    <span className={`ui-spinner ui-spinner--${size}`} />
  </div>
)

export default Spinner
