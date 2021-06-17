import { React } from 'uebersicht'
import { classnames, clickEffect, compareObjects, hardRefresh } from '../../utils'
import { CloseIcon } from '../icons.jsx'

import { defaultSettings, getSettings, setSettings, settingsData } from '../../settings'

const { useState, useEffect, useCallback, Fragment } = React

const Item = ({ code, defaultValue, label, type, options, placeholder, onChange }) => {
  const onClick = (e) => clickEffect(e)
  if (type === 'select') {
    return (
      <>
        <label htmlFor={code}>{label}</label>
        <select id={code} className="settings__select" onChange={onChange} defaultValue={defaultValue}>
          {options.map((option) => (
            <option key={option.code} value={option.code}>
              {option.name}
            </option>
          ))}
        </select>
      </>
    )
  }
  if (type === 'radio') {
    return options.map((option) => (
      <div className="settings__item-option" key={option} onClick={onClick}>
        <input name={code} id={option} value={option} type="radio" defaultChecked={option === defaultValue} />
        <label htmlFor={option}>
          {option} {label}
        </label>
      </div>
    ))
  }
  if (type === 'text') {
    return (
      <>
        <label htmlFor={code}>{label}</label>
        <input
          id={code}
          type="text"
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={onChange}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </>
    )
  }
  return (
    <>
      <input id={code} type="checkbox" defaultChecked={defaultValue} onChange={onChange} onClick={onClick} />
      <label htmlFor={code} onClick={onClick}>
        {label}
      </label>
    </>
  )
}

const LAST_CURRENT_TAB = 'simple-bar-last-current-settings-tab'

const getLastCurrentTab = () => {
  const storedLastCurrentTab = window.sessionStorage.getItem(LAST_CURRENT_TAB)
  if (storedLastCurrentTab) return parseInt(storedLastCurrentTab)
  return 0
}

const Settings = () => {
  const [visible, setVisible] = useState(false)
  const [currentTab, setCurrentTab] = useState(getLastCurrentTab())
  const [pendingChanges, setPendingChanges] = useState(0)
  const settings = getSettings()
  const [newSettings, setNewSettings] = useState(settings)

  const closeSettings = () => setVisible(false)

  const onKeydown = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && (e.which === 188 || e.keyCode === 188)) {
      setVisible(true)
    }
  }, [])

  const onTabClick = (tab) => {
    setCurrentTab(tab)
    window.sessionStorage.setItem(LAST_CURRENT_TAB, tab)
  }

  const onRefreshClick = (e) => {
    clickEffect(e)
    setPendingChanges(0)
    setSettings(newSettings)
    hardRefresh()
  }

  useEffect(() => {
    const diffs = compareObjects(getSettings(), newSettings)
    const deepDiffs = Object.keys(diffs).reduce((acc, key) => [...acc, ...Object.keys(diffs[key])], [])
    setPendingChanges(deepDiffs.length)
  }, [newSettings])

  useEffect(() => {
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [])

  const classes = classnames('settings', {
    'settings--visible': visible
  })

  return (
    <div className={classes}>
      <div className="settings__overlay" onClick={closeSettings} />
      <div className="settings__outer">
        <div className="settings__header">
          Settings
          <CloseIcon className="settings__close" onClick={closeSettings} />
        </div>
        <div className="settings__tabs">
          {Object.keys(defaultSettings).map((key, i) => {
            const setting = settingsData[key]
            if (!setting) return null
            const { label } = setting
            const classes = classnames('settings__tab', {
              'settings__tab--current': i === currentTab
            })
            return (
              <button key={i} className={classes} onClick={() => onTabClick(i)}>
                {label}
              </button>
            )
          })}
        </div>
        <div className="settings__inner">
          {Object.keys(defaultSettings).map((key) => {
            const setting = settingsData[key]
            if (!setting) return null
            const { label, infos } = setting
            return (
              <div key={key} className="settings__category" style={{ transform: `translateX(-${100 * currentTab}%)` }}>
                <div className="settings__inner-title">{label}</div>
                {Object.keys(defaultSettings[key]).map((subKey) => {
                  const subSetting = settingsData[subKey]
                  if (!subSetting) return null
                  const { title, label, type, options, placeholder, fullWidth } = subSetting
                  const defaultValue = newSettings[key][subKey]
                  const classes = classnames('settings__item', {
                    'settings__item--radio': type === 'radio',
                    'settings__item--text': type === 'text',
                    'settings__item--full-width': fullWidth
                  })
                  const onChange = (e) => {
                    const value = type === 'checkbox' ? e.target.checked : e.target.value
                    const updatedSettings = { ...newSettings, [key]: { ...newSettings[key], [subKey]: value } }
                    setNewSettings(updatedSettings)
                  }

                  return (
                    <Fragment key={subKey}>
                      {title && <div className="settings__item-title">{title}</div>}
                      <div key={subKey} className={classes} onChange={type === 'radio' ? onChange : undefined}>
                        <Item
                          code={subKey}
                          defaultValue={defaultValue}
                          type={type}
                          label={label}
                          options={options}
                          placeholder={placeholder}
                          onChange={onChange}
                        />
                      </div>
                    </Fragment>
                  )
                })}
                {infos && infos.length && (
                  <div className="settings__infos">
                    <div className="settings__infos-title">Tips</div>
                    {infos.map((info, i) => (
                      <div key={i} className="settings__info" dangerouslySetInnerHTML={{ __html: info }} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <div className="settings__bottom">
          {pendingChanges !== 0 && (
            <div className="settings__pending-changes">
              <b>{pendingChanges}</b> pending change{pendingChanges > 1 && 's'}
            </div>
          )}
          <button className="settings__refresh-button" onClick={onRefreshClick} disabled={!pendingChanges}>
            Refresh simple-bar
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
