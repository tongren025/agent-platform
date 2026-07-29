function cancelShapeCreationOnLongPress(editor, cancelPendingCreation) {
  if (!editor.getInstanceState().isCoarsePointer) return;
  cancelPendingCreation();
}
export {
  cancelShapeCreationOnLongPress
};
//# sourceMappingURL=cancelShapeCreationOnLongPress.mjs.map
