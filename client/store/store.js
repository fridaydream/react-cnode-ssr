import AppStateClass from './app-state'

export const AppState = AppStateClass

export default {
  AppState
}

export const createStoreMap = () => ({
  appState: new AppState()
})
