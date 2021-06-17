export { specterStyles } from '../../styles/components/data/specter'

const Specter = () => {
  return (
    <div className="specter">
      {[...new Array(6)].map((_, i) => (
        <span key={i} />
      ))}
    </div>
  )
}

export default Specter
