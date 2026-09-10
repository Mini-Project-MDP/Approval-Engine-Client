import { StyleProvider } from '@ant-design/cssinjs'
import { IconProvider } from '@ant-design/icons'
import { App as AntApp, ConfigProvider } from 'antd'
import AppRouter from './routes/AppRouter'
import { CurrentUserProvider } from './context/CurrentUserContext'
import { antdTheme } from './theme/antdTheme'

function App() {
  return (
    // `layer` wraps antd's injected CSS in `@layer antd`, so — combined with
    // the `@layer theme, base, antd, components, utilities` order declared
    // in index.css — a Tailwind utility class always wins a specificity tie
    // against an antd component default, letting Tailwind still be used
    // freely for one-off layout/spacing on top of antd components.
    <StyleProvider layer>
      {/* Direct icons use v6 while antd ships v5. Give both the same layer
          so icon CSS cannot move antd ahead of Tailwind's reset on direct loads. */}
      <IconProvider value={{ layer: 'antd' }}>
      <ConfigProvider theme={antdTheme}>
        <AntApp>
          <CurrentUserProvider>
            <AppRouter />
          </CurrentUserProvider>
        </AntApp>
      </ConfigProvider>
      </IconProvider>
    </StyleProvider>
  )
}

export default App
