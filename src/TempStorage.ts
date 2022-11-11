import { randomBytes } from 'crypto'
import { existsSync } from 'fs'
import { mkdir, readFile, rm, writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { resolve } from 'path'

export type TempStorageCallbackSignature<T> = (
  dir: string,
  scopedFilesystem: ScopedFilesystemDriver,
) => Promise<T>

export const withTempStorage = async <T>(callback: TempStorageCallbackSignature<T>): Promise<T> => {
  const dir = `${tmpdir()}/${getRandomName()}`

  try {
    await mkdir(`${dir}`)
    const scopedFilesystem = new ScopedFilesystem(resolve(dir))

    return await callback(dir, scopedFilesystem)
  } finally {
    await rm(resolve(dir), { recursive: true })
  }
}

const getRandomName = (): string => {
  return randomBytes(32).toString('hex')
}

export interface ScopedFilesystemDriver {
  write(filename: string, contents: string): Promise<void>
  mkdir(dirname: string): Promise<void>
  exists(path: string): boolean
  read(path: string): Promise<Buffer>
}

class ScopedFilesystem implements ScopedFilesystemDriver {
  private absoluteDirPath: string

  public constructor(absoluteDirPath: string) {
    this.absoluteDirPath = absoluteDirPath
  }

  public async write(filename: string, content: string): Promise<void> {
    await writeFile(`${this.absoluteDirPath}/${filename}`, content)
  }

  public async mkdir(dirname: string): Promise<void> {
    await mkdir(`${this.absoluteDirPath}/${dirname}`)
  }

  public exists(path: string): boolean {
    return existsSync(`${this.absoluteDirPath}/${path}`)
  }

  public async read(path: string): Promise<Buffer> {
    return await readFile(`${this.absoluteDirPath}/${path}`)
  }
}
