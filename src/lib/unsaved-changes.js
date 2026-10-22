export function createUnsavedChangesGuard({ isDirty, confirmLeave = () => false }) {
  return {
    beforeUnload(event) {
      if (!isDirty()) return;
      event.preventDefault();
      event.returnValue = '';
    },
    beforeNavigate(event) {
      if (!isDirty()) return;
      if (!confirmLeave()) event.cancel();
    }
  };
}
