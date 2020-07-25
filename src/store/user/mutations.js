export function set(state, { user }) {
  state.data = user.toJSON();
}

export function logOut(state) {
  state.data = null;
}
