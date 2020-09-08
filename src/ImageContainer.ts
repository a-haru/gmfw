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
    private images: Map<string, HTMLImageElement> = new Map();

    /**
     * 画像読み込み用のPromiseを保持する
     */
    private promiseItems: Promise<boolean>[] = [];

    private constructor() {}

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
        const promise = new Promise<boolean>((resolve) => {
            // すでに読み込んでいたらtrueを返す
            if (this.images.has(path)) return resolve(true);
            
            // 読み込まれていない画像なら読み込む
            const img = new Image();
            img.addEventListener('load', () => {
                this.images.set(path, img);
                resolve(true);
            });
            // 画像の読み込みに失敗したらfalseを返す
            // エラーにしないためrejectはしない
            img.addEventListener('error', () => {
                resolve(false);
            });
            img.src = path;
        });

        // 全て読み込み完了後に実行できるようにするため
        this.promiseItems.push(promise);

        return promise;
    }

    async isAllLoaded(): Promise<boolean>
    {
        return Promise.all(this.promiseItems)
        .then( () => true)
        .catch(() => false);
    }
}

export default ImageContainer;
