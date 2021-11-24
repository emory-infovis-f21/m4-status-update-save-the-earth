// ------- Scroll reveal animation ------- 
const sr = ScrollReveal({
    distance: '30px',
    duration: 1800,
    reset: true,
});

sr.reveal(`.home__data, .map_container, 
            .scatter_container,
            .sunburst_container`, {
    origin: 'top',
    interval: 200,
})

sr.reveal(`h2`, {
    origin: 'left'
})

// sr.reveal(`.sunburst_container`, {
//     origin: 'right'
// })