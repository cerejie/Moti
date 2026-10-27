export interface IModalRequest<T = unknown> {
  visible: boolean;
  data?: T;
}

export class IModalFormValue<T = unknown> implements IModalRequest<T> {
  visible: boolean = false;
  data?: T;

  constructor(values?: Partial<IModalRequest<T>>) {
    Object.assign(this, values);
  }
}

// "danger" is red like "delete" but reversible, so it skips the cannot-be-undone warning.
export type ConfirmKind = "confirm" | "danger" | "delete";

export interface IConfirmRequest {
  visible: boolean;
  kind?: ConfirmKind;
  title?: string;
  message?: string;
  itemName?: string;
  confirmPhrase?: string;
  okText?: string;
  cancelText?: string;
  onConfirm?: () => unknown;
}
