class AudioContainer
{
    /**
     * @var _instance インスタンスを保持する
     */
    private static _instance: AudioContainer;

    /**
     * 音源のArrayBufferを保持する
     */
    private arrayBuffer: Map<string, ArrayBuffer> = new Map();

    /**
     * ArrayBufferから生成したAudioBufferを保持する
     */
    private sounds: Map<string, AudioBuffer> = new Map();

    /**
     * 内部で使用するAudioContextを保持する
     */
    private context: AudioContext;

    /**
     * initializeメソッドが実行済みフラグ
     */
    private initialized: boolean = false;

    /**
     * 読み込みを許可するmimetype
     */
    private allowedMimeTypeList: string[] = [
        'audio/mpeg',
        'audio/aac',
        'audio/ogg',
        'audio/wav'
    ];

    private constructor() {}

    /**
     * インスタンスを返す(Singleton)
     */
    public static get instance(): AudioContainer
    {
        if (!this._instance) {
            this._instance = new AudioContainer();
        }

        return this._instance;
    }

    /**
     * AudioContainerの初期化処理
     * ※ブラウザの制限によりユーザ操作でAudioContextを生成しないと音を再生できないため
     */
    public initialize(): boolean
    {
        if (this.initialized) {
            return true;
        }
        const context = new (window.AudioContext || window.webkitAudioContext)();
        this.context = context;
        this.initialized = true;
    }

    /**
     * 引数pathに指定されたURLからオーディオファイルをロードする
     * Promise経由でロードの結果を返します
     * 
     * @param path 音源ファイルへのパス
     */
    public async load(path: string): Promise<boolean>
    {
        const promise = new Promise<boolean>((resolve) => {
            if (this.arrayBuffer.has(path)) {
                return resolve(true);
            }

            const xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';

            xhr.addEventListener('loadend', () =>{
                if (xhr.status !== 200 || !this.allowedMimeType(xhr.getResponseHeader('Content-Type'))) {
                    // HTTPステータスが200以外、もしくは許可されていないmimetypeの場合はfalse
                    return resolve(false);
                }
                this.arrayBuffer.set(path, xhr.response);
                this.sounds.set(path, null);
                return resolve(true);
            });
            xhr.addEventListener('timeout',() => {
                // タイムアウトした場合はfalse
                return resolve(false);
            });

            xhr.open('get', path);
            xhr.send();
        });
        return promise;
    }

    /**
     * AudioBufferからAudioBufferSourceNodeを生成して返す  
     * 音源の再生タイミングは呼び出し元で制御する
     * 
     * @param path 音源ファイルへのパス
     */
    public async getSound(path): Promise<AudioBufferSourceNode|null>
    {
        if (!this.initialized) {
            console.log('Not initialize.');
            return null;
        }

        if (!this.arrayBuffer.has(path)) {
            const hasSound = await this.load(path);
            if (!hasSound) {
                console.log('Audio file is not found.');
                return null;
            }
        }

        const audioBuffer = await this.getAudioBuffer(path);
        const node = this.context.createBufferSource();
        node.buffer = audioBuffer;
        node.connect(this.context.destination);
        return node;
    }

    /**
     * 取得済みの音源のAudioBufferを返す
     * 初回呼び出しの場合はArrayBufferからAudioBufferに変換処理を挟みます
     * 
     * @param path 音源ファイルへのパス
     */
    private async getAudioBuffer(path: string): Promise<AudioBuffer>
    {
        let audioBuffer = this.sounds.get(path);

        if (audioBuffer !== null) {
            // AudioBufferに変換済みの場合はすぐ返す
            return audioBuffer;
        }

        return new Promise((resolve) => {
    
            const sound = this.arrayBuffer.get(path);

            // Promise形式だとiOS Safariで動作しないのでCallback形式で記入
            this.context.decodeAudioData(sound, (data) => {
                // AudioContextに変換した結果を登録
                this.sounds.set(path, data);

                // Promiseに結果を返す
                resolve(data);
            });
        });
    }

    /**
     * 指定されたmimetypeが許可されているかチェックする
     * 
     * @param mimetype チェックするmimetype
     */
    private allowedMimeType(mimetype: string): boolean
    {
        return this.allowedMimeTypeList.indexOf(mimetype) >= 0;
    }
}

export default AudioContainer;
