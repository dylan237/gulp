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
// gulp sass --env prod 切換sass開發環境(壓縮檔案)
// gulp --env prod 切換全部開發環境

var options = minimist(process.argv.slice(2), envOptions)
console.log(options)

//gulp clean 刪除public資料夾
gulp.task('clean', function () {
        cache.clearAll()
    return gulp.src(['./.tmp', './public'], {read: false})
        .pipe($.clean())
});

// 共用html合併
gulp.task( 'fileinclude', function () {
    return gulp.src(['./source/**/*.html','!source/partial/**'])
        .pipe($.plumber())
        .pipe(fileinclude({
            prefix: '@@', // 變量前綴@@include 
            basepath: './source/partial', // 引用文件路徑 
            indent: true, // 保留文件的縮進
            context: {
                name: 'test',
                arr: ['test1', 'test2']
            }
        }))
        .pipe(gulp.dest( './public/')); // 輸出文件路徑 
});

// gulp.task('copyHTML', function () {
//     return gulp.src('./source/**/*.html')
//         .pipe($.plumber())
//         .pipe(gulp.dest('./public/'))
// });

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
            // includePaths: ['./node_module/bootstrap/scss'] //將此路徑載入'./public/css'
            includePaths: ['./node_modules/bootstrap/scss']
        })
        .on('error', $.sass.logError))
        //編譯完成 CSS
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
        // 合併成一支js
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
                quality: "low",//圖片品質:low,medium,high and veryhigh
                min: 40,//最低品質
                max: 85,
                loops: 6,//循環嘗試次數,預設為6
                // accurate: false,//高精度模式
                // method: "smallfry",//網路優化:mpe,ssim,ms-min,smallfry
                // progressive: false,//類型：Boolean默認：false無損壓縮jpg圖片
                // interlaced: true, //類型：Boolean默認：false隔行掃描gif進行渲染
                // multipass: true,  //類型：Boolean默認：false多次優化svg直到完全優化
                // subsmaple: "default"//子採樣:default,disable
              }),
            imageminPngQuant(), //使用pngquant深度压缩png图片的imagemin插件
            imagemin.svgo()
            ]))))
        .pipe(gulp.dest('./public/images'))
);

//引入node_modules中需要的js檔至'./.tmp/vendors'
gulp.task('toVendors', function() {
    return gulp.src(['./node_modules/bootstrap/js/dist/alert.js'])
    .pipe($.plumber())
    .pipe(gulp.dest('./.tmp/vendors'))
    cb(err);
});

// gulp.task('bower', function(){
//     return gulp.src(mainBowerFiles({
//         "overrides": {
//             "vue": {                       // 套件名稱
//                 "main": "dist/vue.js"      // 取用的資料夾路徑
//             },
//             "bootstrap": {
//                 "main": "dist/js/bootstrap.js"
//             }
//         }
//     }))
//     .pipe(gulp.dest('./.tmp/vendors'));
//     cb(err);
// });

//合併壓縮BOWER的JS檔 
gulp.task('vendorJs', ['toVendors'], function() {  // ['bower'] --> 等待此執行完畢才繼續跑
    return gulp.src('./.tmp/vendors/**/**.js')
    // 排列順序
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
// 部屬github pages / gulp deploy
gulp.task('deploy', function() {
    return gulp.src('./public/**/*')
        .pipe($.ghPages());
});

//發布用流程 gulp build --env prod
gulp.task('build', gulpSequence('clean', 'fileinclude', 'jade', 'sass', 'babel', 'vendorJs', 'imgmin'));
//開發用流程 gulp
gulp.task('default', ['fileinclude', 'jade', 'sass', 'babel', 'vendorJs', 'imgmin', 'watch']);

//rimraf node_modules
