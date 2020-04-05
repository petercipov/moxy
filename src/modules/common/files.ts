import fs from 'fs'
import paths from 'path'

export function appendFile (path: string, data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.appendFile(path, data, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export function writeFile (path: string, data: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export function readDir (path: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    fs.readdir(path, (err, filesNames) => {
      if (err) {
        reject(err)
      } else {
        resolve(filesNames)
      }
    })
  })
}

export function readFile (path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data: Buffer) => {
      if (err) {
        reject(err)
      } else {
        resolve(data.toString())
      }
    })
  })
}

export async function writeJSON (path: string, obj: any): Promise<void> {
  return writeFile(path, JSON.stringify(obj, null, 2))
}

export async function readJSON (path: string): Promise<any> {
  const raw = await readFile(path)
  return JSON.parse(raw)
}

export function deleteFile (path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export function mkdir (path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.mkdir(path, { recursive: true }, (err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export function filePath (dirPath: string, filename: string) {
  return `${dirPath}${paths.sep}${filename}`
}

export function dirName (fileName: string) {
  return paths.dirname(fileName)
}
