var animation = bodymovin.loadAnimation({
    container: document.getElementById('bm'),
    renderer: 'svg',
    rendererSettings: {
        filterSize: {
          width: '200%',
          height: '200%',
          x: '-50%',
          y: '-50%',
        }
    },
    loop: true,
    autoplay: true, 
    path: 'home-06.json'
})