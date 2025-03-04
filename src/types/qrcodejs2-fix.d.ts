declare module 'qrcodejs2-fix' {
  export default class QRCode {
    static CorrectLevel: {
      L: number
      M: number
      Q: number
      H: number
    }

    constructor(element: string | HTMLElement, options?: {
      text?: string
      width?: number
      height?: number
      colorDark?: string
      colorLight?: string
      correctLevel?: number
    })
    clear(): void
    makeCode(text: string): void
  }
} 