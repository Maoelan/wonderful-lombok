import test from 'node:test';
import assert from 'node:assert/strict';
import { createUnsavedChangesGuard } from '../src/lib/unsaved-changes.js';

function fakeUnloadEvent() {
  return {
    prevented: false,
    returnValue: undefined,
    preventDefault() { this.prevented = true; }
  };
}

function fakeNavigationEvent() {
  return {
    canceled: false,
    cancel() { this.canceled = true; }
  };
}

test('leaves without warning when there are no unsaved changes', () => {
  const guard = createUnsavedChangesGuard({ isDirty: () => false });
  const unload = fakeUnloadEvent();
  const navigation = fakeNavigationEvent();

  guard.beforeUnload(unload);
  guard.beforeNavigate(navigation);

  assert.equal(unload.prevented, false);
  assert.equal(unload.returnValue, undefined);
  assert.equal(navigation.canceled, false);
});

test('warns before unloading a dirty page', () => {
  const guard = createUnsavedChangesGuard({ isDirty: () => true });
  const unload = fakeUnloadEvent();

  guard.beforeUnload(unload);

  assert.equal(unload.prevented, true);
  assert.equal(unload.returnValue, '');
});

test('cancels client navigation unless the user confirms leaving', () => {
  let allowLeave = false;
  const guard = createUnsavedChangesGuard({ isDirty: () => true, confirmLeave: () => allowLeave });
  const navigation = fakeNavigationEvent();

  guard.beforeNavigate(navigation);
  assert.equal(navigation.canceled, true);

  navigation.canceled = false;
  allowLeave = true;
  guard.beforeNavigate(navigation);
  assert.equal(navigation.canceled, false);
});
