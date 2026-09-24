import {
  selectConfirm,
  selectConfirmPhrase,
  selectConfirmRunning,
  useConfirmStore,
} from "../../store/common/confirm.store";

export const useConfirm = () => useConfirmStore((state) => state.openConfirm);

export const useConfirmation = () => {
  const confirm = useConfirmStore(selectConfirm);
  const running = useConfirmStore(selectConfirmRunning);
  const phrase = useConfirmStore(selectConfirmPhrase);
  const setPhrase = useConfirmStore((state) => state.setPhrase);
  const closeConfirm = useConfirmStore((state) => state.closeConfirm);
  const runConfirm = useConfirmStore((state) => state.runConfirm);

  return { confirm, running, phrase, setPhrase, closeConfirm, runConfirm };
};
