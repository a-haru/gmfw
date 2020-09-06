/**
 * 画像を管理するクラス
 */
class ImageContainer
{
    /**
     * インスタンスを保持する
     */
    private static _instance: ImageContainer;

    /**
     * 画像を保持する
     */
    private images: Map<string, HTMLImageElement>;

    private constructor() {
        this.images = new Map();
    }

    /**
     * インスタンスを返す
     */
    public static get instance(): ImageContainer
    {
        if (!this._instance) {
            this._instance = new ImageContainer();
        }

        return this._instance;
    }

    /**
     * ロード済みの画像要素を返す
     * @param path 
     */
    async getImage(path: string): Promise<HTMLImageElement|null>
    {
        if (!this.images.has(path)) {
            const hasImages = await this.load(path);
            if (!hasImages) {
                return null;
            }
        }
        return this.images.get(path);
    }

    /**
     * 与えられたpathから画像をロードする
     * @param path 
     */
    async load(path: string): Promise<boolean>
    {
        return new Promise((resolve) => {
            if (this.images.has(path)) {
                // すでに読み込んでいたらtrueを返す
                resolve(true);
            } else {
                // 読み込まれていない画像なら読み込む
                const img = new Image();
                img.addEventListener('load', (e) => {
                    this.images.set(path, img);
                    resolve(true);
                });
                img.addEventListener('error', (e) => resolve(false));
                img.src = path;
            }
        });
    }
}

export default ImageContainer;
