import { ScopedFilesystemDriver, withTempStorage } from '../TempStorage'
import { existsSync } from 'fs'
import { resolve } from 'path'

describe('Temp Storage Tests', () => {
  describe('tempStorage', () => {
    it('create random temp dir', async () => {
      await withTempStorage(async (dir: string, _scopedFilesystem: ScopedFilesystemDriver) => {
        expect(existsSync(resolve(dir))).toBe(true)
      })
    })

    it('cleans up random temp dir', async () => {
      const randomDirname = await withTempStorage(
        async (dir: string, _scopedFilesystem: ScopedFilesystemDriver) => {
          expect(existsSync(resolve(dir))).toBe(true)

          return dir
        },
      )

      expect(existsSync(resolve(randomDirname))).toBe(false)
    })
  })

  describe('scoped filesystem', () => {
    describe('writeFile', () => {
      it('scoped filesystem write to temp dir', async () => {
        const filename = 'test.txt'
        const content = 'Hello, World!'

        const randomDirname = await withTempStorage(
          async (dir: string, scopedFilesystem: ScopedFilesystemDriver) => {
            await scopedFilesystem.write(filename, content)

            expect(existsSync(resolve(`${dir}/${filename}`))).toBe(true)

            return dir
          },
        )

        expect(existsSync(resolve(randomDirname))).toBe(false)
      })
    })

    describe('mkdir', () => {
      it('scoped filesystem can write to new dir in temp dir', async () => {
        const dirname = 'levelOne'
        const filename = 'test.txt'
        const content = 'Hello, World!'

        const randomDirname = await withTempStorage(
          async (dir: string, scopedFilesystem: ScopedFilesystemDriver) => {
            await scopedFilesystem.mkdir(dirname)
            await scopedFilesystem.write(`${dirname}/${filename}`, content)

            expect(existsSync(resolve(`${dir}/${dirname}/${filename}`))).toBe(true)

            return dir
          },
        )

        expect(existsSync(resolve(randomDirname))).toBe(false)
      })
    })

    describe('exists', () => {
      it('return true when file exists', async () => {
        await withTempStorage(async (dir: string, scopedFilesystem: ScopedFilesystemDriver) => {
          const filename = 'test.txt'
          await scopedFilesystem.write(filename, 'content')

          expect(scopedFilesystem.exists(filename)).toBe(true)
        })
      })

      it('return false when file does not exist', async () => {
        await withTempStorage(async (dir: string, scopedFilesystem: ScopedFilesystemDriver) => {
          const filename = 'test.txt'

          expect(scopedFilesystem.exists(filename)).toBe(false)
        })
      })

      it('return true when directory exists', async () => {
        await withTempStorage(async (dir: string, scopedFilesystem: ScopedFilesystemDriver) => {
          const dirname = 'test'
          await scopedFilesystem.mkdir(dirname)

          expect(scopedFilesystem.exists(dirname)).toBe(true)
        })
      })

      it('return false when directory does not exist', async () => {
        await withTempStorage(async (dir: string, scopedFilesystem: ScopedFilesystemDriver) => {
          const dirname = 'test'

          expect(scopedFilesystem.exists(dirname)).toBe(false)
        })
      })
    })

    describe('read', () => {
      it('scoped filesystem can read from temp dir', async () => {
        const filename = 'test.txt'
        const content = 'Hello, World!'

        await withTempStorage(async (dir: string, scopedFilesystem: ScopedFilesystemDriver) => {
          await scopedFilesystem.write(filename, content)

          const result = await scopedFilesystem.read(filename)
          expect(result.toString()).toBe(content)
        })
      })
    })

    it('scoped filesystem can write to new dir in temp dir', async () => {
      const dirname = 'levelOne'
      const filename = 'test.txt'
      const content = 'Hello, World!'

      const randomDirname = await withTempStorage(
        async (dir: string, scopedFilesystem: ScopedFilesystemDriver) => {
          await scopedFilesystem.mkdir(dirname)
          await scopedFilesystem.write(`${dirname}/${filename}`, content)

          expect(existsSync(resolve(`${dir}/${dirname}/${filename}`))).toBe(true)

          return dir
        },
      )

      expect(existsSync(resolve(randomDirname))).toBe(false)
    })
  })
})
