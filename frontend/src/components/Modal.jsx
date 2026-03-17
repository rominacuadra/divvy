import styles from './Modal.module.css'

export default function Modal({ title, onClose, children }) {
  return (
    <div className={styles.bg} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.box}>
        <h3 className={styles.title}>{title}</h3>
        {children}
      </div>
    </div>
  )
}
