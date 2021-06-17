import { React } from 'uebersicht'
import { appIcons } from '../../app-icons'
import { classnames, clickEffect, startSliding, stopSliding } from '../../utils'
import { focusWindow } from '../../yabai'

const { useRef } = React

const Window = ({ app }) => {
  const ref = useRef()
  const { minimized, focused, app: appName, title, id } = app
  if (minimized === 1) return null
  const isFocused = focused === 1
  const Icon = appIcons[appName] || appIcons['Default']
  const classes = classnames('process__window', {
    'process__window--focused': isFocused
  })
  const onClick = (e) => {
    clickEffect(e)
    focusWindow(id)
  }
  const onMouseEnter = () => startSliding(ref.current, '.process__inner', '.process__name')
  const onMouseLeave = () => stopSliding(ref.current, '.process__name')

  const processName = appName !== title && title.length ? `${appName} / ${title}` : appName

  return (
    <button ref={ref} className={classes} onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <Icon className="process__icon" />
      <span className="process__inner">
        <span className="process__name">{processName}</span>
      </span>
    </button>
  )
}

export default Window
