import ImageContainer from './ImageContainer';

const container = ImageContainer.instance;

(async () => {
    const a = [
        './01.jpg',
        './02.jpg',
        './03.jpg',
        './04.jpg',
        './05.jpg',
        './06.jpg'
    ];
    Promise.all(a.map(async (path) => {
        return container.getImage(path);
    })).then((l) => {
        console.dir(l.map((el => el == null ? null : el)));
    });
})();