let gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    cleanCSS = require('gulp-clean-css'),
    paths = {};

/* Error Handler -------------------------------- */

const catchError = function (err) {

    console.log(err.toString());
    this.emit('end')

};

/* View ----------------------------------------- */

paths.view = {
	php: [
		'../view.php'
	],
	js: [
		'./scripts/_gup.js',
		'./scripts/api.js',
		'./scripts/csrf_protection.js',
		'./scripts/view/main.js',
		'./scripts/main/build.js',
		'./scripts/main/header.js',
		'./scripts/main/visible.js',
		'./scripts/main/sidebar.js',
		'./scripts/main/lychee_locale.js',
	],
	scripts: [
		'node_modules/jquery/dist/jquery.min.js',
		'node_modules/lazysizes/lazysizes.js',
		'node_modules/basiccontext/dist/basicContext.min.js',
		'../dist/_view--javascript.js'
	],
	svg: [
		'./images/iconic.svg',
		'./images/ionicons.svg'
	],
};

gulp.task('view--js', function() {

    const babel = plugins.babel({
        presets: ['env']
    });

    return gulp.src(paths.view.js)
	           .pipe(plugins.concat('_view--javascript.js', {newLine: "\n"}))
	           .pipe(babel)
	           .on('error', catchError)
	           .pipe(gulp.dest('../dist/'))

});

gulp.task('view--scripts', gulp.series('view--js', function() {

	return gulp.src(paths.view.scripts)
	           .pipe(plugins.concat('view.js', {newLine: "\n"}))
	           // .pipe(plugins.uglify())
	           .on('error', catchError)
	           .pipe(gulp.dest('../dist/'))

}));

gulp.task('view--svg', function() {

	return gulp.src(paths.view.php, {allowEmpty: true})
	           .pipe(plugins.inject(gulp.src(paths.view.svg), {
	           	starttag: '<!-- inject:svg -->',
	           	transform: function(filePath, file) { return file.contents.toString('utf8') }
	           }))
	           .pipe(gulp.dest('../'))

 });


/* Main ----------------------------------------- */

paths.main = {
	html: [
		'../index.html'
	],
	js: [
		'./scripts/*.js',
		'./scripts/main/*.js'
	],
	scripts: [
		'node_modules/jquery/dist/jquery.min.js',
		'node_modules/lazysizes/lazysizes.js',
		'node_modules/mousetrap/mousetrap.min.js',
		'node_modules/mousetrap/plugins/global-bind/mousetrap-global-bind.min.js',
		'node_modules/basiccontext/dist/basicContext.min.js',
		'node_modules/basicmodal/dist/basicModal.min.js',
		'node_modules/body-scroll-lock/lib/bodyScrollLock.min.js',
		'node_modules/multiselect-two-sides/dist/js/multiselect.min.js',
		'node_modules/justified-layout/dist/justified-layout.min.js',
		'../dist/_main--javascript.js'
	],
	scss: [
		'./styles/main/*.scss'
	],
	styles: [
		'node_modules/basiccontext/src/styles/main.scss',
		'node_modules/basiccontext/src/styles/addons/popin.scss',
		'node_modules/basicmodal/src/styles/main.scss',
		'./styles/main/main.scss'
	],
	svg: [
		'./images/iconic.svg',
		'./images/ionicons.svg'
	]
};

gulp.task('main--js', function() {

    const babel = plugins.babel({
        presets: ['env']
    });

    return gulp.src(paths.main.js)
	           .pipe(plugins.concat('_main--javascript.js', {newLine: "\n"}))
	           .pipe(babel)
	           .on('error', catchError)
	           .pipe(gulp.dest('../dist/'))

});

gulp.task('main--scripts', gulp.series('main--js', function() {

	return gulp.src(paths.main.scripts)
	           .pipe(plugins.concat('main.js', {newLine: "\n"}))
	           // .pipe(plugins.uglify())
	           .on('error', catchError)
	           .pipe(gulp.dest('../dist/'))

}));

gulp.task('main--styles', function() {

	return gulp.src(paths.main.styles)
	           .pipe(plugins.sass())
	           .on('error', catchError)
	           .pipe(plugins.concat('main.css', {newLine: "\n"}))
	           .pipe(plugins.autoprefixer('last 4 versions', '> 5%'))
	           .pipe(cleanCSS({level: 2}))
	           .pipe(gulp.dest('../dist/'))

});

gulp.task('main--svg', function() {

	return gulp.src(paths.main.html, {allowEmpty: true})
	           .pipe(plugins.inject(gulp.src(paths.main.svg), {
	           	starttag: '<!-- inject:svg -->',
	           	transform: function(filePath, file) { return file.contents.toString('utf8') }
	           }))
	           .pipe(gulp.dest('../'))

 });

/* Frame -----------------------------------------  */

paths.frame = {
	js: [
		'./scripts/_gup.js',
		'./scripts/api.js',
		'./scripts/csrf_protection.js',
		'./scripts/frame/main.js',
	],
	scss: [
		'./styles/frame/*.scss'
	],
	styles: [
		'./styles/frame/frame.scss'
	],
	scripts: [
		'node_modules/jquery/dist/jquery.min.js',
		'node_modules/lazysizes/lazysizes.js',
		'./scripts/frame/stackblur.min.js',
		'../dist/_frame--javascript.js'
	],
};

gulp.task('frame--js', function() {

	const babel = plugins.babel({
		presets: ['env']
	});

	return gulp.src(paths.frame.js)
		.pipe(plugins.concat('_frame--javascript.js', {newLine: "\n"}))
		.pipe(babel)
		.on('error', catchError)
		.pipe(gulp.dest('../dist/'))

});

gulp.task('frame--styles', function() {

	return gulp.src(paths.frame.styles)
		.pipe(plugins.sass())
		.on('error', catchError)
		.pipe(plugins.concat('frame.css', {newLine: "\n"}))
		.pipe(plugins.autoprefixer('last 4 versions', '> 5%'))
		.pipe(cleanCSS({level: 2}))
		.pipe(gulp.dest('../dist/'))

});

gulp.task('frame--scripts', gulp.series('frame--js', function() {

	return gulp.src(paths.frame.scripts)
		.pipe(plugins.concat('frame.js', {newLine: "\n"}))
		// .pipe(plugins.uglify())
		.on('error', catchError)
		.pipe(gulp.dest('../dist/'))

}));


/* Landing -----------------------------------------  */

paths.landing = {
	js: [
		'./scripts/_gup.js',
		'./scripts/landing/*.js',
	],
	scripts: [
		'node_modules/jquery/dist/jquery.min.js',
		'node_modules/lazysizes/lazysizes.js',
		'../dist/_landing--javascript.js'
	],
	scss: [
		'./styles/landing/*.scss',
		'./styles/page/fonts.scss',
		'./styles/page/menu.scss',
		'./styles/page/social.scss',
		'./styles/page/animate.scss'
	],
	styles: [
		'./styles/landing/landing.scss'
	],
};

gulp.task('landing--js', function() {

	const babel = plugins.babel({
		presets: ['env']
	});

	return gulp.src(paths.landing.js)
		.pipe(plugins.concat('_landing--javascript.js', {newLine: "\n"}))
		.pipe(babel)
		.on('error', catchError)
		.pipe(gulp.dest('../dist/'))

});

gulp.task('landing--scripts', gulp.series('landing--js', function() {

	return gulp.src(paths.landing.scripts)
		.pipe(plugins.concat('landing.js', {newLine: "\n"}))
		// .pipe(plugins.uglify())
		.on('error', catchError)
		.pipe(gulp.dest('../dist/'))

}));

gulp.task('landing--styles', function() {

	return gulp.src(paths.landing.styles)
		.pipe(plugins.sass())
		.on('error', catchError)
		.pipe(plugins.concat('landing.css', {newLine: "\n"}))
		.pipe(plugins.autoprefixer('last 4 versions', '> 5%'))
		// .pipe(cleanCSS({level: 2}))
		.pipe(gulp.dest('../dist/'))

});


/* Page -----------------------------------------  */

paths.page = {
	scss: [
		'./styles/page/*.scss',
		'./styles/page/*.scss'
	],
	styles: [
		'./styles/page/page.scss'
	],
};

gulp.task('page--styles', function() {

	return gulp.src(paths.page.styles)
		.pipe(plugins.sass())
		.on('error', catchError)
		.pipe(plugins.concat('page.css', {newLine: "\n"}))
		.pipe(plugins.autoprefixer('last 4 versions', '> 5%'))
		// .pipe(cleanCSS({level: 2}))
		.pipe(gulp.dest('../dist/'))

});

/* Images ----------------------------------------- */


paths.images = {
	src: [
		'./images/password.svg',
		'./images/no_cover.svg',
		'./images/no_images.svg',
		'./images/*png'
	]
};

gulp.task('images--copy', function () {
	return gulp.src(paths.images.src)
		.on('error', catchError)
		.pipe(gulp.dest('../img'))
});

/* Clean ----------------------------------------- */



gulp.task('clean', function() {

	return gulp.src('../dist/_*.*', { read: false })
	           .pipe(plugins.rimraf({ force: true }))
	           .on('error', catchError)

});

/* Tasks ----------------------------------------- */

gulp.task('default', gulp.series(gulp.parallel('view--svg', 'view--scripts',
												'main--svg', 'main--scripts', 'main--styles',
												'frame--scripts', 'frame--styles',
												'landing--scripts', 'landing--styles', 'page--styles',
												'images--copy'
	), 'clean'));

gulp.task('watch', gulp.series('default', function() {

	gulp.watch(paths.frame.js, gulp.series('frame--scripts'));
	gulp.watch(paths.view.js, gulp.series('view--scripts'));
	gulp.watch(paths.main.js, gulp.series('main--scripts'));
	gulp.watch(paths.main.scss, gulp.series('main--styles'));

}));
