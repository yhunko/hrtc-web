export function set(state, { user, data }) {
  state.auth = user.toJSON();
  state.data = data;
}

export function logOut(state) {
  state.auth = null;
  state.data = null;
}
