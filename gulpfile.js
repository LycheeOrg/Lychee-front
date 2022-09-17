let gulp = require("gulp"),
	plugins = require("gulp-load-plugins")(),
	cleanCSS = require("gulp-clean-css"),
	del = require("del"),
	sass = require("gulp-sass")(require("sass")),
	paths = {};

/* Error Handler -------------------------------- */

const catchError = function (err) {
	console.log(err.toString());
	this.emit("end");
};

/* View ----------------------------------------- */

paths.view = {
	php: ["../view.php"],
	js: [
		"./scripts/api.js",
		"./scripts/csrf_protection.js",
		"./scripts/view/main.js",
		"./scripts/main/build.js",
		"./scripts/main/header.js",
		"./scripts/main/visible.js",
		"./scripts/main/sidebar.js",
		"./scripts/main/mapview.js",
		"./scripts/main/lychee_locale.js",
		"./scripts/main/tabindex.js",
		"./scripts/3rd-party/backend.js",
		"./deps/basiccontext/scripts/basicContext.js",
	],
	scripts: [
		"node_modules/jquery/dist/jquery.min.js",
		"node_modules/lazysizes/lazysizes.min.js",
		"node_modules/sprintf-js/dist/sprintf.min.js",
		"../dist/_view--javascript.js",
	],
	svg: ["./images/iconic.svg", "./images/ionicons.svg"],
};

gulp.task("view--js", function () {
	const babel = plugins.babel({
		presets: ["env"],
	});

	return gulp
		.src(paths.view.js)
		.pipe(plugins.concat("_view--javascript.js", { newLine: "\n" }))
		.pipe(babel)
		.on("error", catchError)
		.pipe(gulp.dest("../dist/"));
});

gulp.task(
	"view--scripts",
	gulp.series("view--js", function () {
		return (
			gulp
				.src(paths.view.scripts)
				.pipe(plugins.concat("view.js", { newLine: "\n" }))
				// .pipe(plugins.uglify())
				.on("error", catchError)
				.pipe(gulp.dest("../dist/"))
		);
	})
);

gulp.task("view--svg", function () {
	return gulp
		.src(paths.view.php, { allowEmpty: true })
		.pipe(
			plugins.inject(gulp.src(paths.view.svg), {
				starttag: "<!-- inject:svg -->",
				transform: function (filePath, _file) {
					return _file.contents.toString("utf8");
				},
			})
		)
		.pipe(gulp.dest("../"));
});

/* Main ----------------------------------------- */

paths.main = {
	html: ["../index.html"],
	js: ["./scripts/*.js", "./scripts/main/*.js", "./scripts/3rd-party/backend.js", "./deps/basiccontext/scripts/basicContext.js"],
	scripts: [
		"node_modules/jquery/dist/jquery.min.js",
		"node_modules/lazysizes/lazysizes.min.js",
		"node_modules/mousetrap/mousetrap.min.js",
		"node_modules/mousetrap/plugins/global-bind/mousetrap-global-bind.min.js",
		"node_modules/basicmodal/dist/basicModal.min.js",
		"node_modules/scroll-lock/dist/scroll-lock.min.js",
		"node_modules/multiselect-two-sides/dist/js/multiselect.min.js",
		"node_modules/justified-layout/dist/justified-layout.min.js",
		"node_modules/leaflet/dist/leaflet.js",
		"node_modules/leaflet-rotatedmarker/leaflet.rotatedMarker.js",
		"node_modules/spin.js/spin.min.js",
		"node_modules/leaflet-gpx/gpx.js",
		"node_modules/leaflet-spin/leaflet.spin.min.js",
		"node_modules/leaflet.markercluster/dist/leaflet.markercluster.js",
		"node_modules/livephotoskit/livephotoskit.js",
		"node_modules/qr-creator/dist/qr-creator.min.js",
		"node_modules/sprintf-js/dist/sprintf.min.js",
		"modules/Leaflet.Photo-gh-pages/Leaflet.Photo.js",
		"../dist/_main--javascript.js",
	],
	scss: ["./styles/main/*.scss"],
	styles: [
		"node_modules/basicmodal/src/styles/main.scss",
		"./deps/basiccontext/styles/main.scss",
		"./deps/basiccontext/styles/addons/popin.scss",
		"./styles/main/main.scss",
		"node_modules/leaflet/dist/leaflet.css",
		"node_modules/leaflet.markercluster/dist/MarkerCluster.css",
		"modules/Leaflet.Photo-gh-pages/Leaflet.Photo.css",
	],
	svg: ["./images/iconic.svg", "./images/ionicons.svg"],
};

gulp.task("main--js", function () {
	const babel = plugins.babel({
		presets: ["env"],
	});

	return gulp
		.src(paths.main.js)
		.pipe(plugins.concat("_main--javascript.js", { newLine: "\n" }))
		.pipe(babel)
		.on("error", catchError)
		.pipe(gulp.dest("../dist/"));
});

gulp.task(
	"main--scripts",
	gulp.series("main--js", function () {
		return (
			gulp
				.src(paths.main.scripts)
				.pipe(plugins.concat("main.js", { newLine: "\n" }))
				// .pipe(plugins.uglify())
				.on("error", catchError)
				.pipe(gulp.dest("../dist/"))
		);
	})
);

gulp.task("main--styles", function () {
	return gulp
		.src(paths.main.styles)
		.pipe(sass().on("error", catchError))
		.pipe(plugins.concat("main.css", { newLine: "\n" }))
		.pipe(plugins.autoprefixer("last 4 versions", "> 5%"))
		.pipe(cleanCSS({ level: 2 }))
		.pipe(gulp.dest("../dist/"));
});

gulp.task("main--svg", function () {
	return gulp
		.src(paths.main.html, { allowEmpty: true })
		.pipe(
			plugins.inject(gulp.src(paths.main.svg), {
				starttag: "<!-- inject:svg -->",
				transform: function (filePath, _file) {
					return _file.contents.toString("utf8");
				},
			})
		)
		.pipe(gulp.dest("../"));
});

/* Frame -----------------------------------------  */

paths.frame = {
	js: ["./scripts/api.js", "./scripts/csrf_protection.js", "./scripts/frame/main.js", "./scripts/3rd-party/backend.js"],
	scss: ["./styles/frame/*.scss"],
	styles: ["./styles/frame/frame.scss"],
	scripts: [
		"node_modules/jquery/dist/jquery.min.js",
		"node_modules/lazysizes/lazysizes.min.js",
		"./scripts/frame/stackblur.min.js",
		"../dist/_frame--javascript.js",
	],
};

gulp.task("frame--js", function () {
	const babel = plugins.babel({
		presets: ["env"],
	});

	return gulp
		.src(paths.frame.js)
		.pipe(plugins.concat("_frame--javascript.js", { newLine: "\n" }))
		.pipe(babel)
		.on("error", catchError)
		.pipe(gulp.dest("../dist/"));
});

gulp.task("frame--styles", function () {
	return gulp
		.src(paths.frame.styles)
		.pipe(sass().on("error", catchError))
		.pipe(plugins.concat("frame.css", { newLine: "\n" }))
		.pipe(plugins.autoprefixer("last 4 versions", "> 5%"))
		.pipe(cleanCSS({ level: 2 }))
		.pipe(gulp.dest("../dist/"));
});

gulp.task(
	"frame--scripts",
	gulp.series("frame--js", function () {
		return (
			gulp
				.src(paths.frame.scripts)
				.pipe(plugins.concat("frame.js", { newLine: "\n" }))
				// .pipe(plugins.uglify())
				.on("error", catchError)
				.pipe(gulp.dest("../dist/"))
		);
	})
);



/* Unified ----------------------------------------- */

paths.unified = {
	js: ["./scripts/*.js", "./scripts/main/*.js", "./scripts/3rd-party/backend.js", "./deps/basiccontext/scripts/basicContext.js"],
	scripts: [
		"node_modules/jquery/dist/jquery.min.js",
		"node_modules/lazysizes/lazysizes.min.js",
		"node_modules/mousetrap/mousetrap.min.js",
		"node_modules/mousetrap/plugins/global-bind/mousetrap-global-bind.min.js",
		"node_modules/basicmodal/dist/basicModal.min.js",
		"node_modules/scroll-lock/dist/scroll-lock.min.js",
		"node_modules/multiselect-two-sides/dist/js/multiselect.min.js",
		"node_modules/justified-layout/dist/justified-layout.min.js",
		"node_modules/leaflet/dist/leaflet.js",
		"node_modules/leaflet-rotatedmarker/leaflet.rotatedMarker.js",
		"node_modules/spin.js/spin.min.js",
		"node_modules/leaflet-gpx/gpx.js",
		"node_modules/leaflet-spin/leaflet.spin.min.js",
		"node_modules/leaflet.markercluster/dist/leaflet.markercluster.js",
		"node_modules/livephotoskit/livephotoskit.js",
		"node_modules/qr-creator/dist/qr-creator.min.js",
		"node_modules/sprintf-js/dist/sprintf.min.js",
		"modules/Leaflet.Photo-gh-pages/Leaflet.Photo.js",
		"../dist/_unified--javascript.js",
	],
	scss: ["./styles/main/*.scss"],
	styles: [
		"node_modules/basicmodal/src/styles/main.scss",
		"./deps/basiccontext/styles/main.scss",
		"./deps/basiccontext/styles/addons/popin.scss",
		"./styles/main/main.scss",
		"node_modules/leaflet/dist/leaflet.css",
		"node_modules/leaflet.markercluster/dist/MarkerCluster.css",
		"modules/Leaflet.Photo-gh-pages/Leaflet.Photo.css",
	],
	html: ["./html/unified.html"]
};

gulp.task("unified--js", function () {
	const babel = plugins.babel({
		presets: ["env"],
	});

	return gulp
		.src(paths.unified.js)
		.pipe(plugins.concat("_unified--javascript.js", { newLine: "\n" }))
		.pipe(babel)
		.on("error", catchError)
		.pipe(gulp.dest("../dist/"));
});

gulp.task(
	"unified--scripts",
	gulp.series("unified--js", function () {
		return (
			gulp
				.src(paths.unified.scripts)
				.pipe(plugins.concat("unified.js", { newLine: "\n" }))
				.on("error", catchError)
				.pipe(gulp.dest("../dist/"))
		);
	})
);

gulp.task("unified--styles", function () {
	return gulp
		.src(paths.unified.styles)
		.pipe(sass().on("error", catchError))
		.pipe(plugins.concat("unified.css", { newLine: "\n" }))
		.pipe(plugins.autoprefixer("last 4 versions", "> 5%"))
		.pipe(cleanCSS({ level: 2 }))
		.pipe(gulp.dest("../dist/"));
});

gulp.task("unified--html", function () {
	return gulp
		.src(paths.unified.html)
		.pipe(plugins.concat("frontend.html", { newLine: "\n" }))
		.on("error", catchError).pipe(gulp.dest(".."));
});

/* Landing -----------------------------------------  */

paths.landing = {
	js: ["./scripts/landing/*.js"],
	scripts: ["node_modules/jquery/dist/jquery.min.js", "node_modules/lazysizes/lazysizes.min.js", "../dist/_landing--javascript.js"],
	scss: [
		"./styles/landing/*.scss",
		"./styles/page/fonts.scss",
		"./styles/page/menu.scss",
		"./styles/page/social.scss",
		"./styles/page/animate.scss",
	],
	styles: ["./styles/landing/landing.scss"],
};

gulp.task("landing--js", function () {
	const babel = plugins.babel({
		presets: ["env"],
	});

	return gulp
		.src(paths.landing.js)
		.pipe(plugins.concat("_landing--javascript.js", { newLine: "\n" }))
		.pipe(babel)
		.on("error", catchError)
		.pipe(gulp.dest("../dist/"));
});

gulp.task(
	"landing--scripts",
	gulp.series("landing--js", function () {
		return (
			gulp
				.src(paths.landing.scripts)
				.pipe(plugins.concat("landing.js", { newLine: "\n" }))
				// .pipe(plugins.uglify())
				.on("error", catchError)
				.pipe(gulp.dest("../dist/"))
		);
	})
);

gulp.task("landing--styles", function () {
	return (
		gulp
			.src(paths.landing.styles)
			.pipe(sass().on("error", catchError))
			.pipe(plugins.concat("landing.css", { newLine: "\n" }))
			.pipe(plugins.autoprefixer("last 4 versions", "> 5%"))
			// .pipe(cleanCSS({level: 2}))
			.pipe(gulp.dest("../dist/"))
	);
});

/* Page -----------------------------------------  */

paths.page = {
	scss: ["./styles/page/*.scss", "./styles/page/*.scss"],
	styles: ["./styles/page/page.scss"],
};

gulp.task("page--styles", function () {
	return (
		gulp
			.src(paths.page.styles)
			.pipe(sass().on("error", catchError))
			.pipe(plugins.concat("page.css", { newLine: "\n" }))
			.pipe(plugins.autoprefixer("last 4 versions", "> 5%"))
			// .pipe(cleanCSS({level: 2}))
			.pipe(gulp.dest("../dist/"))
	);
});

/* Page -----------------------------------------  */

paths.TVCSS = {
	src: ["./styles/devices/TV.scss"],
};

gulp.task("TVCSS--styles", function () {
	return gulp
		.src(paths.TVCSS.src)
		.on("error", catchError)
		.pipe(plugins.concat("TV.css", { newLine: "\n" }))
		.pipe(plugins.autoprefixer("last 4 versions", "> 5%"))
		.pipe(gulp.dest("../dist/"));
});

/* Images ----------------------------------------- */

paths.images = {
	src: ["./images/password.svg", "./images/no_cover.svg", "./images/no_images.svg", "./node_modules/leaflet/dist/images/*png", "./images/*png"],
};

gulp.task("images--copy", function () {
	return gulp.src(paths.images.src).on("error", catchError).pipe(gulp.dest("../img"));
});

/* leaflet.markercluster.js.map ----------------------------------------- */

paths.leafletMarkerclusterMapFile = {
	src: ["./node_modules/leaflet.markercluster/dist/leaflet.markercluster.js.map"],
};

gulp.task("leafletMarkerclusterMapFile--copy", function () {
	return gulp.src(paths.leafletMarkerclusterMapFile.src).on("error", catchError).pipe(gulp.dest("../dist"));
});

paths.leafletMarkerclusterSourceFiles = {
	src: ["./node_modules/leaflet.markercluster/src/*.js"],
};

gulp.task("leafletMarkerclusterSourceFiles--copy", function () {
	return gulp.src(paths.leafletMarkerclusterSourceFiles.src).on("error", catchError).pipe(gulp.dest("../src"));
});

/* Clean ----------------------------------------- */

gulp.task("clean", function () {
	return del(["../dist/_*.*"], { force: true }).catch((error) => console.log(error));
});

/* Tasks ----------------------------------------- */

gulp.task(
	"default",
	gulp.series(
		gulp.parallel(
			"view--svg",
			"view--scripts",
			"main--svg",
			"main--scripts",
			"main--styles",
			"frame--scripts",
			"frame--styles",
			"unified--scripts",
			"unified--styles",
			"unified--html",
			"landing--scripts",
			"landing--styles",
			"page--styles",
			"TVCSS--styles",
			"images--copy",
			"leafletMarkerclusterMapFile--copy",
			"leafletMarkerclusterSourceFiles--copy"
		),
		"clean"
	)
);

gulp.task(
	"watch",
	gulp.series("default", function () {
		gulp.watch(paths.frame.js, gulp.series("frame--scripts"));
		gulp.watch(paths.view.js, gulp.series("view--scripts"));
		gulp.watch(paths.main.js, gulp.series("main--scripts"));
		gulp.watch(paths.main.scss, gulp.series("main--styles"));
	})
);
