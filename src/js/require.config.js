require.config({
    baseUrl: './',
    

    urlArgs: String("r="+ (new Date()).getTime()),
    paths: {
        'jquery'        : './bower/jquery/dist/jquery.min',
        'responsive'    : './bower/responseive/responsive.min',
        'underscore'    : './bower/underscore',
    },
    shim: {
        "underscore": { exports: "_" },
        "jquery": { exports: "$" },
        "Handlebars": { exports: "Handlebars" },
    }

});

