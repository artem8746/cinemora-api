export interface IFileStoragePort {
  upload(key: string, body: Buffer): Promise<string>;
  getFileUrl(key: string, expiresIn?: number): Promise<string>;
  delete?(key: string): Promise<void>;
}

export const PUBLIC_FILE_STORAGE = Symbol('PUBLIC_FILE_STORAGE');
export const PRIVATE_FILE_STORAGE = Symbol('PRIVATE_FILE_STORAGE');
