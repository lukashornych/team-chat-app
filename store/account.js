// Vuex store for logged in account state

export const state = () => ({
  loggedInUser: {
    id: 1,
    username: 'lukas',
    name: 'Lukáš',
    created: '2021-04-02T13:14:00',
    role: 'ADMINISTRATOR'
  }
})

export const getters = {
  isLoggedIn (state) {
    return state.loggedInUser != null
  },

  isAdministrator (state, getters) {
    if (!getters.isLoggedIn) {
      return false
    }
    return state.loggedInUser.role === 'ADMINISTRATOR'
  },

  isModerator (state, getters) {
    if (!getters.isLoggedIn) {
      return false
    }
    return state.loggedInUser.role === 'MODERATOR'
  }
}
