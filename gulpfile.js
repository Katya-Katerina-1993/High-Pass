const { src, series, dest, watch } = require('gulp');

const htmlMin = require('gulp-htmlmin');
const autoprefixes = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const image = require('gulp-image');
const babel = require('gulp-babel');
const notify = require('gulp-notify');
const uglify = require('gulp-uglify-es').default;
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const conditions = require('gulp-if');
const argv = require('yargs').argv;
const browserSync = require('browser-sync').create();

const clean = () => {
  return del(['dist'])
}

const resources = () => {
  return src('src/recources/**')
    .pipe(dest('dist'))
}

const htmlMinify = () => {
  return src('src/**/*.html')
    .pipe(htmlMin({
      collapseWhitespace: true,
    }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const styles = () => {
  return src('src/styles/**/*.css')
    .pipe(sourcemaps.init())
    .pipe(autoprefixes({
      cascade: false
    }))
    .pipe(cleanCSS({
      level: 2
    }))
    .pipe(conditions(!argv.prod, sourcemaps.write()))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const scripts = () => {
  return src([
    'src/js/components/**/*.js',
    'src/js/main.js'
  ])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(conditions(argv.prod, uglify().on('error', notify.onError())))
    .pipe(conditions(!argv.prod, sourcemaps.write()))
    .pipe(dest('dist'))
    .pipe(browserSync.stream())
}

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: 'dist'
    }
  })
}

const images = () => {
  return src([
    'src/images/**/*.jpg',
    'src/images/**/*.png',
    'src/images/**/*.svg',
    'src/images/**/*.jpeg',
  ])
    .pipe(image())
    .pipe(dest('dist/images'))
}

const fonts = () => {
  return src([
    'src/fonts/**/*.woff',
    'src/fonts/**/*.woff2',
  ])
    .pipe(dest('dist/fonts'))
}

watch('src/**/*.html', htmlMinify);
watch('src/styles/**/*.css', styles);
watch('src/images/svg/**/*.svg', images);
watch('src/js/**/*.js', scripts);
watch('src/resources/**', resources);

exports.htmlMinify = htmlMinify;
exports.styles = styles;
exports.scripts = scripts;
exports.default = series(clean, resources, htmlMinify, scripts, styles, images, fonts, watchFiles);
