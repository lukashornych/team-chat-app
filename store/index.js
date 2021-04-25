import base64url from 'base64-url'
import cookieManager from 'cookie'

// root vuex store

export const actions = {
  // login account if cookie with logged in account exists when populating store
  nuxtServerInit ({ commit }, { req }) {
    const cookies = cookieManager.parse(req.headers.cookie || '')

    const encodedJwtPayload = cookies['jwt-payload']
    if (encodedJwtPayload == null) {
      return
    }

    const jwtPayload = JSON.parse(base64url.decode(encodedJwtPayload))
    commit('account/login', jwtPayload)
  }
}
