var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var autoprefixer = require('autoprefixer');
var mainBowerFiles = require('main-bower-files');
var cleanCSS = require('gulp-clean-css');
var minimist = require('minimist');
var gulpSequence = require('gulp-sequence');
var imagemin = require('gulp-imagemin');
var imageminJpegRecompress = require('imagemin-jpeg-recompress');
var imageminPngQuant  = require ('imagemin-pngquant');
var fileinclude = require('gulp-file-include');
var cache = require('gulp-cache');

var envOptions = {
    string: 'env',
    default: { env: 'dev'}
}

var options = minimist(process.argv.slice(2), envOptions)
console.log(options)

gulp.task('clean', function () {
        cache.clearAll()
    return gulp.src(['./.tmp', './public'], {read: false})
        .pipe($.clean())
});

gulp.task( 'fileinclude', function () {
    return gulp.src(['./source/**/*.html','!source/partial/**'])
        .pipe($.plumber())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: './source/partial',
            indent: true,
            context: {
                name: 'test',
                arr: ['test1', 'test2']
            }
        }))
        .pipe(gulp.dest( './public/')); 
});

gulp.task('jade', function () {
    // var YOUR_LOCALS = {};
    gulp.src(['./source/**/*.jade', './source/**/*.pug', '!source/partial/**'])
        .pipe($.plumber())
        .pipe($.jade({
            pretty: true
            // locals: YOUR_LOCALS
        }))
        // .pipe($.if(options.env === 'prod', $.uglify()))
        .pipe(gulp.dest('./public/'))
});

gulp.task('sass', function () {
    var plugins = [
        autoprefixer({browsers: ['last 5 version']})
    ];

    return gulp.src(['./source/sass/**/*.scss', './source/sass/**/*.sass'])
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.sass({
            outputStyle: 'nested',
            // includePaths: ['./node_module/bootstrap/scss']
            includePaths: ['./node_modules/bootstrap/scss']
        })
        .on('error', $.sass.logError))
        .pipe($.postcss(plugins))
        .pipe($.if(options.env === 'prod', cleanCSS()))
        // .pipe($.minifyCss())
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('babel', () => {
    return gulp.src('./source/js/**/*.js')
        .pipe($.plumber())
        .pipe($.sourcemaps.init())
        .pipe($.babel({
            presets: ['es2015']
        }))

        .pipe($.concat('bundle.js'))
        .pipe($.if(options.env === 'prod', $.uglify({
            compress: {
                drop_console: true
            }
        })))
        .pipe($.sourcemaps.write('.'))
        .pipe(gulp.dest('./public/js'));
    });

gulp.task('imgmin', () =>
    gulp.src('./source/images/**/*')
        .pipe($.if(options.env === 'prod', cache(imagemin([
            imagemin.gifsicle({interlaced: true}), 
            imageminJpegRecompress({
                quality: "low",
                min: 40,
                max: 85,
                loops: 6,
              }),
            imageminPngQuant(),
            imagemin.svgo()
            ]))))
        .pipe(gulp.dest('./public/images'))
);

gulp.task('toVendors', function() {
    return gulp.src(['./node_modules/bootstrap/js/dist/alert.js'])
    .pipe($.plumber())
    .pipe(gulp.dest('./.tmp/vendors'))
    cb(err);
});

gulp.task('vendorJs', ['toVendors'], function() {
    return gulp.src('./.tmp/vendors/**/**.js')

    .pipe($.order([
        'jquery.js',
        'bootstrap.js',
        'vue.js'
    ]))
    .pipe($.concat('vendor.js'))
    .pipe($.if(options.env === 'prod', $.uglify()))
    .pipe(gulp.dest('./public/js'))
})

gulp.task('watch', function () {
    // gulp.watch('./source/*.html', ['html']);
    gulp.watch('./source/*.html', ['fileinclude']);
    gulp.watch('./source/*.jade', ['jade']);
    gulp.watch('./source/*.pug', ['pug']);
    gulp.watch('./source/sass/**/*.scss', ['sass']);
    gulp.watch('./source/js/**/*.js', ['babel']);
});

gulp.task('deploy', function() {
    return gulp.src('./public/**/*')
        .pipe($.ghPages());
});

gulp.task('build', gulpSequence('clean', 'fileinclude', 'jade', 'sass', 'babel', 'vendorJs', 'imgmin'));
gulp.task('default', ['fileinclude', 'jade', 'sass', 'babel', 'vendorJs', 'imgmin', 'watch']);
