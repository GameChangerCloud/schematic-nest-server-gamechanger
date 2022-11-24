export class UserNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.stack = (<any>new Error()).stack;
  }
}
