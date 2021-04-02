// expects user to not be authenticated
export default function ({ store, redirect }) {
  if (store.getters['account/isLoggedIn']) {
    return redirect({ name: 'index' })
  }
}
