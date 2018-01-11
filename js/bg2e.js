"use strict";
var bg = {};
bg.version = "1.2.11 - build: fd14c4f";
bg.utils = {};
Reflect.defineProperty = Reflect.defineProperty || Object.defineProperty;
(function(win) {
  win.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback, element) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();
  bg.utils.initWebGLContext = function(canvas) {
    var context = {
      gl: null,
      supported: false,
      experimental: false
    };
    try {
      context.gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
      context.supported = context.gl != null;
    } catch (e) {
      context.supported = false;
    }
    if (!context.supported) {
      try {
        context.gl = canvas.getContext("experimental-webgl", {preserveDrawingBuffer: true});
        context.supported = context.gl != null;
        context.experimental = true;
      } catch (e) {}
    }
    if (context) {
      context.gl.uuid = Symbol(context.gl);
    }
    return context;
  };
  bg.utils.isBigEndian = function() {
    var arr32 = new Uint32Array(1);
    var arr8 = new Uint8Array(arr32.buffer);
    arr32[0] = 255;
    return arr32[3] == 255;
  };
  bg.utils.isLittleEndian = function() {
    var arr32 = new Uint32Array(1);
    var arr8 = new Uint8Array(arr32.buffer);
    arr32[0] = 255;
    return arr32[0] == 255;
  };
  var UserAgent = function() {
    function UserAgent(userAgentString) {
      this.system = {};
      this.browser = {};
      if (!userAgentString) {
        userAgentString = navigator.userAgent;
      }
      this.parseOperatingSystem(userAgentString);
      this.parseBrowser(userAgentString);
    }
    return ($traceurRuntime.createClass)(UserAgent, {
      parseOperatingSystem: function(userAgentString) {
        this.system.OSX = /Macintosh/.test(userAgentString);
        this.system.Windows = /Windows/.test(userAgentString);
        this.system.iPhone = /iPhone/.test(userAgentString);
        this.system.iPodTouch = /iPod/.test(userAgentString);
        this.system.iPad = /iPad/.test(userAgentString);
        this.system.iOS = this.system.iPhone || this.system.iPad || this.system.iPodTouch;
        this.system.Android = /Android/.test(userAgentString);
        this.system.Linux = (this.system.Android) ? false : /Linux/.test(userAgentString);
        if (this.system.OSX) {
          this.system.OSName = "OS X";
          this.parseOSXVersion(userAgentString);
        } else if (this.system.Windows) {
          this.system.OSName = "Windows";
          this.parseWindowsVersion(userAgentString);
        } else if (this.system.Linux) {
          this.system.OSName = "Linux";
          this.parseLinuxVersion(userAgentString);
        } else if (this.system.iOS) {
          this.system.OSName = "iOS";
          this.parseIOSVersion(userAgentString);
        } else if (this.system.Android) {
          this.system.OSName = "Android";
          this.parseAndroidVersion(userAgentString);
        }
      },
      parseBrowser: function(userAgentString) {
        this.browser.Version = {};
        this.browser.Safari = /Version\/([\d\.]+) Safari\//.test(userAgentString);
        if (this.browser.Safari) {
          this.browser.Name = "Safari";
          this.browser.Vendor = "Apple";
          this.browser.Version.versionString = RegExp.$1;
        }
        this.browser.Chrome = /Chrome\/([\d\.]+) Safari\//.test(userAgentString);
        if (this.browser.Chrome) {
          this.browser.Name = "Chrome";
          this.browser.Vendor = "Google";
          this.browser.Version.versionString = RegExp.$1;
        }
        this.browser.Opera = /Opera\/[\d\.]+/.test(userAgentString);
        if (this.browser.Opera) {
          this.browser.Name = "Opera";
          this.browser.Vendor = "Opera Software";
          var versionString = /Version\/([\d\.]+)/.test(userAgentString);
          this.browser.Version.versionString = RegExp.$1;
        }
        this.browser.Firefox = /Gecko\/[\d\.]+ Firefox\/([\d\.]+)/.test(userAgentString);
        if (this.browser.Firefox) {
          this.browser.Name = "Firefox";
          this.browser.Vendor = "Mozilla Foundation";
          this.browser.Version.versionString = RegExp.$1;
        }
        this.browser.Edge = /Edge\/(.*)/.test(userAgentString);
        if (this.browser.Edge) {
          var result = /Edge\/(.*)/.exec(userAgentString);
          this.browser.Name = "Edge";
          this.browser.Chrome = false;
          this.browser.Vendor = "Microsoft";
          this.browser.Version.versionString = result[1];
        }
        this.browser.Explorer = /MSIE ([\d\.]+)/.test(userAgentString);
        if (!this.browser.Explorer) {
          var re = /\Mozilla\/5.0 \(([^)]+)\) like Gecko/;
          var matches = re.exec(userAgentString);
          if (matches) {
            re = /rv:(.*)/;
            var version = re.exec(matches[1]);
            this.browser.Explorer = true;
            this.browser.Name = "Internet Explorer";
            this.browser.Vendor = "Microsoft";
            if (version) {
              this.browser.Version.versionString = version[1];
            } else {
              this.browser.Version.versionString = "unknown";
            }
          }
        } else {
          this.browser.Name = "Internet Explorer";
          this.browser.Vendor = "Microsoft";
          this.browser.Version.versionString = RegExp.$1;
        }
        if (this.system.iOS) {
          this.browser.IsMobileVersion = true;
          this.browser.MobileSafari = /Version\/([\d\.]+) Mobile/.test(userAgentString);
          if (this.browser.MobileSafari) {
            this.browser.Name = "Mobile Safari";
            this.browser.Vendor = "Apple";
            this.browser.Version.versionString = RegExp.$1;
          }
          this.browser.Android = false;
        } else if (this.system.Android) {
          this.browser.IsMobileVersion = true;
          this.browser.Android = /Version\/([\d\.]+) Mobile/.test(userAgentString);
          if (this.browser.MobileSafari) {
            this.browser.Name = "Android Browser";
            this.browser.Vendor = "Google";
            this.browser.Version.versionString = RegExp.$1;
          } else {
            this.browser.Chrome = /Chrome\/([\d\.]+)/.test(userAgentString);
            this.browser.Name = "Chrome";
            this.browser.Vendor = "Google";
            this.browser.Version.versionString = RegExp.$1;
          }
          this.browser.Safari = false;
        } else {
          this.browser.IsMobileVersion = false;
        }
        this.parseBrowserVersion(userAgentString);
      },
      parseBrowserVersion: function(userAgentString) {
        if (/([\d]+)\.([\d]+)\.*([\d]*)/.test(this.browser.Version.versionString)) {
          this.browser.Version.major = Number(RegExp.$1);
          this.browser.Version.minor = Number(RegExp.$2);
          this.browser.Version.revision = (RegExp.$3) ? Number(RegExp.$3) : 0;
        }
      },
      parseOSXVersion: function(userAgentString) {
        var versionString = (/Mac OS X (\d+_\d+_*\d*)/.test(userAgentString)) ? RegExp.$1 : '';
        this.system.Version = {};
        if (versionString != '') {
          if (/(\d+)_(\d+)_*(\d*)/.test(versionString)) {
            this.system.Version.major = Number(RegExp.$1);
            this.system.Version.minor = Number(RegExp.$2);
            this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3) : 0;
          }
        } else {
          versionString = (/Mac OS X (\d+\.\d+\.*\d*)/.test(userAgentString)) ? RegExp.$1 : 'Unknown';
          if (/(\d+)\.(\d+)\.*(\d*)/.test(versionString)) {
            this.system.Version.major = Number(RegExp.$1);
            this.system.Version.minor = Number(RegExp.$2);
            this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3) : 0;
          }
        }
        if (!this.system.Version.major) {
          this.system.Version.major = 0;
          this.system.Version.minor = 0;
          this.system.Version.revision = 0;
        }
        this.system.Version.stringValue = this.system.Version.major + '.' + this.system.Version.minor + '.' + this.system.Version.revision;
        switch (this.system.Version.minor) {
          case 0:
            this.system.Version.name = "Cheetah";
            break;
          case 1:
            this.system.Version.name = "Puma";
            break;
          case 2:
            this.system.Version.name = "Jaguar";
            break;
          case 3:
            this.system.Version.name = "Panther";
            break;
          case 4:
            this.system.Version.name = "Tiger";
            break;
          case 5:
            this.system.Version.name = "Leopard";
            break;
          case 6:
            this.system.Version.name = "Snow Leopard";
            break;
          case 7:
            this.system.Version.name = "Lion";
            break;
          case 8:
            this.system.Version.name = "Mountain Lion";
            break;
        }
      },
      parseWindowsVersion: function(userAgentString) {
        this.system.Version = {};
        if (/NT (\d+)\.(\d*)/.test(userAgentString)) {
          this.system.Version.major = Number(RegExp.$1);
          this.system.Version.minor = Number(RegExp.$2);
          this.system.Version.revision = 0;
          this.system.Version.stringValue = "NT " + this.system.Version.major + "." + this.system.Version.minor;
          var major = this.system.Version.major;
          var minor = this.system.Version.minor;
          var name = 'undefined';
          if (major == 5) {
            if (minor == 0)
              this.system.Version.name = '2000';
            else
              this.system.Version.name = 'XP';
          } else if (major == 6) {
            if (minor == 0)
              this.system.Version.name = 'Vista';
            else if (minor == 1)
              this.system.Version.name = '7';
            else if (minor == 2)
              this.system.Version.name = '8';
          }
        } else {
          this.system.Version.major = 0;
          this.system.Version.minor = 0;
          this.system.Version.name = "Unknown";
          this.system.Version.stringValue = "Unknown";
        }
      },
      parseLinuxVersion: function(userAgentString) {
        this.system.Version = {};
        this.system.Version.major = 0;
        this.system.Version.minor = 0;
        this.system.Version.revision = 0;
        this.system.Version.name = "";
        this.system.Version.stringValue = "Unknown distribution";
      },
      parseIOSVersion: function(userAgentString) {
        this.system.Version = {};
        if (/iPhone OS (\d+)_(\d+)_*(\d*)/i.test(userAgentString)) {
          this.system.Version.major = Number(RegExp.$1);
          this.system.Version.minor = Number(RegExp.$2);
          this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3) : 0;
          this.system.Version.stringValue = this.system.Version.major + "." + this.system.Version.minor + '.' + this.system.Version.revision;
          this.system.Version.name = "iOS";
        } else {
          this.system.Version.major = 0;
          this.system.Version.minor = 0;
          this.system.Version.name = "Unknown";
          this.system.Version.stringValue = "Unknown";
        }
      },
      parseAndroidVersion: function(userAgentString) {
        this.system.Version = {};
        if (/Android (\d+)\.(\d+)\.*(\d*)/.test(userAgentString)) {
          this.system.Version.major = Number(RegExp.$1);
          this.system.Version.minor = Number(RegExp.$2);
          this.system.Version.revision = (RegExp.$3) ? Number(RegExp.$3) : 0;
          this.system.Version.stringValue = this.system.Version.major + "." + this.system.Version.minor + '.' + this.system.Version.revision;
        } else {
          this.system.Version.major = 0;
          this.system.Version.minor = 0;
          this.system.Version.revision = 0;
        }
        if (/Build\/([a-zA-Z]+)/.test(userAgentString)) {
          this.system.Version.name = RegExp.$1;
        } else {
          this.system.Version.name = "Unknown version";
        }
        this.system.Version.stringValue = this.system.Version.major + "." + this.system.Version.minor + '.' + this.system.Version.revision;
      },
      getInfoString: function() {
        return navigator.userAgent;
      }
    }, {});
  }();
  bg.utils.UserAgent = UserAgent;
  bg.utils.userAgent = new UserAgent();
  var Path = function() {
    function Path() {}
    return ($traceurRuntime.createClass)(Path, {
      get sep() {
        return "/";
      },
      join: function(a, b) {
        if (a.lastIndexOf(this.sep) != a.length - 1) {
          return a + this.sep + b;
        } else {
          return a + b;
        }
      },
      extension: function(path) {
        return path.split(".").pop();
      },
      fileName: function(path) {
        return path.split(this.sep).pop();
      },
      removeFileName: function(path) {
        var result = path.split(this.sep);
        result.pop();
        return result.join(this.sep);
      }
    }, {});
  }();
  bg.utils.Path = Path;
  bg.utils.path = new Path();
})(window);

"use strict";
(function() {
  var s_preventImageDump = [];
  var s_preventVideoDump = [];
  var ResourceProvider = function() {
    function ResourceProvider() {}
    return ($traceurRuntime.createClass)(ResourceProvider, {
      getRequest: function(url, onSuccess, onFail, onProgress) {},
      loadImage: function(url, onSucces, onFail) {},
      loadVideo: function(url, onSuccess, onFail) {}
    }, {});
  }();
  var HTTPResourceProvider = function($__super) {
    function HTTPResourceProvider() {
      $traceurRuntime.superConstructor(HTTPResourceProvider).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(HTTPResourceProvider, {
      getRequest: function(url, onSuccess, onFail, onProgress) {
        var req = new XMLHttpRequest();
        if (!onProgress) {
          onProgress = function(progress) {
            console.log(("Loading " + progress.file + ": " + progress.loaded / progress.total * 100 + " %"));
          };
        }
        req.open("GET", url, true);
        req.addEventListener("load", function() {
          if (req.status === 200) {
            onSuccess(req);
          } else {
            onFail(new Error(("Error receiving data: " + req.status + ", url: " + url)));
          }
        }, false);
        req.addEventListener("error", function() {
          onFail(new Error(("Cannot make AJAX request. Url: " + url)));
        }, false);
        req.addEventListener("progress", function(evt) {
          onProgress({
            file: url,
            loaded: evt.loaded,
            total: evt.total
          });
        }, false);
        return req;
      },
      loadImage: function(url, onSuccess, onFail) {
        var img = new Image();
        s_preventImageDump.push(img);
        img.crossOrigin = "";
        img.addEventListener("load", function(event) {
          var imageIndex = s_preventImageDump.indexOf(event.target);
          if (imageIndex != -1) {
            s_preventImageDump.splice(imageIndex, 1);
          }
          onSuccess(event.target);
        });
        img.addEventListener("error", function(event) {
          onFail(new Error(("Error loading image: " + url)));
        });
        img.addEventListener("abort", function(event) {
          onFail(new Error(("Image load aborted: " + url)));
        });
        img.src = url;
      },
      loadVideo: function(url, onSuccess, onFail) {
        var video = document.createElement('video');
        s_preventVideoDump.push(video);
        video.crossOrigin = "";
        video.autoplay = true;
        video.setAttribute("playsinline", null);
        video.addEventListener('canplay', function(evt) {
          var videoIndex = s_preventVideoDump.indexOf(evt.target);
          if (videoIndex != -1) {
            s_preventVideoDump.splice(videoIndex, 1);
          }
          onSuccess(event.target);
        });
        video.addEventListener("error", function(evt) {
          onFail(new Error(("Error loading video: " + url)));
        });
        video.addEventListener("abort", function(evt) {
          onFail(new Error(("Error loading video: " + url)));
        });
        video.src = url;
      }
    }, {}, $__super);
  }(ResourceProvider);
  bg.utils.ResourceProvider = ResourceProvider;
  bg.utils.HTTPResourceProvider = HTTPResourceProvider;
  var g_resourceProvider = new HTTPResourceProvider();
  var Resource = function() {
    function Resource() {}
    return ($traceurRuntime.createClass)(Resource, {}, {
      SetResourceProvider: function(provider) {
        g_resourceProvider = provider;
      },
      GetResourceProvider: function() {
        return g_resourceProvider;
      },
      GetExtension: function(url) {
        var match = /\.([a-z0-9-_]*)$/i.exec(url);
        return (match && match[1].toLowerCase()) || "";
      },
      JoinUrl: function(url, path) {
        if (url.length == 0)
          return path;
        if (path.length == 0)
          return url;
        return /\/$/.test(url) ? url + path : url + "/" + path;
      },
      IsFormat: function(url, formats) {
        return formats.find(function(fmt) {
          return fmt == this;
        }, Resource.GetExtension(url)) != null;
      },
      IsImage: function(url) {
        return Resource.IsFormat(url, ["jpg", "jpeg", "gif", "png"]);
      },
      IsBinary: function(url) {
        var binaryFormats = arguments[1] !== (void 0) ? arguments[1] : ["vwglb", "bg2"];
        return Resource.IsFormat(url, binaryFormats);
      },
      IsVideo: function(url) {
        var videoFormats = arguments[1] !== (void 0) ? arguments[1] : ["mp4", "m4v", "ogg", "ogv", "m3u8", "webm"];
        return Resource.IsFormat(url, videoFormats);
      },
      LoadMultiple: function(urlArray, onProgress) {
        var progressFiles = {};
        var progressFunc = function(progress) {
          progressFiles[progress.file] = progress;
          var total = 0;
          var loaded = 0;
          for (var key in progressFiles) {
            var file = progressFiles[key];
            total += file.total;
            loaded += file.loaded;
          }
          if (onProgress) {
            onProgress({
              fileList: urlArray,
              total: total,
              loaded: loaded
            });
          } else {
            console.log(("Loading " + Object.keys(progressFiles).length + " files: " + loaded / total * 100 + "% completed"));
          }
        };
        var resources = [];
        urlArray.forEach(function(url) {
          resources.push(Resource.Load(url, progressFunc));
        });
        var resolvingPromises = resources.map(function(promise) {
          return new Promise(function(resolve) {
            var payload = new Array(2);
            promise.then(function(result) {
              payload[0] = result;
            }).catch(function(error) {
              payload[1] = error;
            }).then(function() {
              resolve(payload);
            });
          });
        });
        var errors = [];
        var results = [];
        return Promise.all(resolvingPromises).then(function(loadedData) {
          var result = {};
          urlArray.forEach(function(url, index) {
            var pl = loadedData[index];
            result[url] = pl[1] ? null : pl[0];
          });
          return result;
        });
      },
      Load: function(url, onProgress) {
        var loader = null;
        switch (true) {
          case url.constructor === Array:
            loader = Resource.LoadMultiple;
            break;
          case Resource.IsImage(url):
            loader = Resource.LoadImage;
            break;
          case Resource.IsBinary(url):
            loader = Resource.LoadBinary;
            break;
          case Resource.IsVideo(url):
            loader = Resource.LoadVideo;
            break;
          case Resource.GetExtension(url) == 'json':
            loader = Resource.LoadJson;
            break;
          default:
            loader = Resource.LoadText;
        }
        return loader(url, onProgress);
      },
      LoadText: function(url, onProgress) {
        return new Promise(function(resolve, reject) {
          g_resourceProvider.getRequest(url, function(req) {
            resolve(req.responseText);
          }, function(error) {
            reject(error);
          }, onProgress).send();
        });
      },
      LoadVideo: function(url, onProgress) {
        return new Promise(function(resolve, reject) {
          g_resourceProvider.loadVideo(url, function(target) {
            resolve(target);
            bg.emitImageLoadEvent(target);
          }, function(err) {
            reject(err);
          });
        });
      },
      LoadBinary: function(url, onProgress) {
        return new Promise(function(resolve, reject) {
          var req = g_resourceProvider.getRequest(url, function(req) {
            resolve(req.response);
          }, function(error) {
            reject(error);
          }, onProgress);
          req.responseType = "arraybuffer";
          req.send();
        });
      },
      LoadImage: function(url) {
        return new Promise(function(resolve, reject) {
          g_resourceProvider.loadImage(url, function(target) {
            resolve(target);
            bg.emitImageLoadEvent(target);
          }, function(err) {
            reject(err);
          });
        });
      },
      LoadJson: function(url) {
        return new Promise(function(resolve, reject) {
          g_resourceProvider.getRequest(url, function(req) {
            try {
              resolve(JSON.parse(req.responseText));
            } catch (e) {
              reject(new Error("Error parsing JSON data"));
            }
          }, function(error) {
            reject(error);
          }).send();
        });
      }
    });
  }();
  bg.utils.Resource = Resource;
  bg.utils.requireGlobal = function(src) {
    var s = document.createElement('script');
    s.src = src;
    s.type = "text/javascript";
    s.async = false;
    document.getElementsByTagName('head')[0].appendChild(s);
  };
})();

"use strict";
(function() {
  var s_Engine = null;
  var Engine = function() {
    function Engine() {}
    return ($traceurRuntime.createClass)(Engine, {
      get id() {
        return this._engineId;
      },
      get texture() {
        return this._texture;
      },
      get pipeline() {
        return this._pipeline;
      },
      get polyList() {
        return this._polyList;
      },
      get shader() {
        return this._shader;
      },
      get colorBuffer() {
        return this._colorBuffer;
      },
      get textureBuffer() {
        return this._textureBuffer;
      },
      get shaderSource() {
        return this._shaderSource;
      }
    }, {
      Set: function(engine) {
        s_Engine = engine;
      },
      Get: function() {
        return s_Engine;
      }
    });
  }();
  bg.Engine = Engine;
})();

"use strict";
(function() {
  var LifeCycle = function() {
    function LifeCycle() {}
    return ($traceurRuntime.createClass)(LifeCycle, {
      init: function() {},
      frame: function(delta) {},
      willDisplay: function(pipeline, matrixState) {},
      display: function(pipeline, matrixState) {},
      displayGizmo: function(pipeline, matrixState) {},
      didDisplay: function(pipeline, matrixState) {},
      reshape: function(pipeline, matrixState, width, height) {},
      keyDown: function(evt) {},
      keyUp: function(evt) {},
      mouseUp: function(evt) {},
      mouseDown: function(evt) {},
      mouseMove: function(evt) {},
      mouseOut: function(evt) {},
      mouseDrag: function(evt) {},
      mouseWheel: function(evt) {},
      touchStart: function(evt) {},
      touchMove: function(evt) {},
      touchEnd: function(evt) {},
      postRedisplay: function() {
        var frames = arguments[0] !== (void 0) ? arguments[0] : 1;
        bg.app.MainLoop.singleton.postRedisplay(frames);
      },
      postReshape: function() {
        bg.app.MainLoop.singleton.postReshape();
      }
    }, {});
  }();
  bg.LifeCycle = LifeCycle;
})();

"use strict";
(function() {
  !function(r) {
    function n(r) {
      for (var n = "",
          t = "",
          o = 0,
          e = 0,
          a = 0,
          i = r.length; i > a; a++) {
        var f = r.charCodeAt(a);
        128 > f ? e++ : (t = 2048 > f ? String.fromCharCode(f >> 6 | 192, 63 & f | 128) : String.fromCharCode(f >> 12 | 224, f >> 6 & 63 | 128, 63 & f | 128), e > o && (n += r.slice(o, e)), n += t, o = e = a + 1);
      }
      return e > o && (n += r.slice(o, i)), n;
    }
    function t(r) {
      var n,
          t;
      if (r += "", s = !1, v = w = r.length, w > 63) {
        for (o(r.substring(0, 64)), i(A), s = !0, n = 128; w >= n; n += 64)
          o(r.substring(n - 64, n)), f(A);
        r = r.substring(n - 64), w = r.length;
      }
      for (d[0] = d[1] = d[2] = d[3] = d[4] = d[5] = d[6] = d[7] = d[8] = d[9] = d[10] = d[11] = d[12] = d[13] = d[14] = d[15] = 0, n = 0; w > n; n++)
        t = 3 & n, 0 === t ? d[n >> 2] = r.charCodeAt(n) : d[n >> 2] |= r.charCodeAt(n) << C[t];
      return d[n >> 2] |= h[3 & n], n > 55 ? (s ? f(d) : (i(d), s = !0), f([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, v << 3, 0])) : (d[14] = v << 3, void(s ? f(d) : i(d)));
    }
    function o(r) {
      for (var n = 16; n--; ) {
        var t = n << 2;
        A[n] = r.charCodeAt(t) + (r.charCodeAt(t + 1) << 8) + (r.charCodeAt(t + 2) << 16) + (r.charCodeAt(t + 3) << 24);
      }
    }
    function e(r, o, e) {
      t(o ? r : n(r));
      var a = g[0];
      return u[1] = l[15 & a], u[0] = l[15 & (a >>= 4)], u[3] = l[15 & (a >>= 4)], u[2] = l[15 & (a >>= 4)], u[5] = l[15 & (a >>= 4)], u[4] = l[15 & (a >>= 4)], u[7] = l[15 & (a >>= 4)], u[6] = l[15 & (a >>= 4)], a = g[1], u[9] = l[15 & a], u[8] = l[15 & (a >>= 4)], u[11] = l[15 & (a >>= 4)], u[10] = l[15 & (a >>= 4)], u[13] = l[15 & (a >>= 4)], u[12] = l[15 & (a >>= 4)], u[15] = l[15 & (a >>= 4)], u[14] = l[15 & (a >>= 4)], a = g[2], u[17] = l[15 & a], u[16] = l[15 & (a >>= 4)], u[19] = l[15 & (a >>= 4)], u[18] = l[15 & (a >>= 4)], u[21] = l[15 & (a >>= 4)], u[20] = l[15 & (a >>= 4)], u[23] = l[15 & (a >>= 4)], u[22] = l[15 & (a >>= 4)], a = g[3], u[25] = l[15 & a], u[24] = l[15 & (a >>= 4)], u[27] = l[15 & (a >>= 4)], u[26] = l[15 & (a >>= 4)], u[29] = l[15 & (a >>= 4)], u[28] = l[15 & (a >>= 4)], u[31] = l[15 & (a >>= 4)], u[30] = l[15 & (a >>= 4)], e ? u : u.join("");
    }
    function a(r, n, t, o, e, a, i) {
      return n += r + o + i, (n << e | n >>> a) + t << 0;
    }
    function i(r) {
      c(0, 0, 0, 0, r), g[0] = y[0] + 1732584193 << 0, g[1] = y[1] - 271733879 << 0, g[2] = y[2] - 1732584194 << 0, g[3] = y[3] + 271733878 << 0;
    }
    function f(r) {
      c(g[0], g[1], g[2], g[3], r), g[0] = y[0] + g[0] << 0, g[1] = y[1] + g[1] << 0, g[2] = y[2] + g[2] << 0, g[3] = y[3] + g[3] << 0;
    }
    function c(r, n, t, o, e) {
      var i,
          f;
      s ? (r = a((t ^ o) & n ^ o, r, n, e[0], 7, 25, -680876936), o = a((n ^ t) & r ^ t, o, r, e[1], 12, 20, -389564586), t = a((r ^ n) & o ^ n, t, o, e[2], 17, 15, 606105819), n = a((o ^ r) & t ^ r, n, t, e[3], 22, 10, -1044525330)) : (r = e[0] - 680876937, r = (r << 7 | r >>> 25) - 271733879 << 0, o = e[1] - 117830708 + (2004318071 & r ^ -1732584194), o = (o << 12 | o >>> 20) + r << 0, t = e[2] - 1126478375 + ((-271733879 ^ r) & o ^ -271733879), t = (t << 17 | t >>> 15) + o << 0, n = e[3] - 1316259209 + ((o ^ r) & t ^ r), n = (n << 22 | n >>> 10) + t << 0), r = a((t ^ o) & n ^ o, r, n, e[4], 7, 25, -176418897), o = a((n ^ t) & r ^ t, o, r, e[5], 12, 20, 1200080426), t = a((r ^ n) & o ^ n, t, o, e[6], 17, 15, -1473231341), n = a((o ^ r) & t ^ r, n, t, e[7], 22, 10, -45705983), r = a((t ^ o) & n ^ o, r, n, e[8], 7, 25, 1770035416), o = a((n ^ t) & r ^ t, o, r, e[9], 12, 20, -1958414417), t = a((r ^ n) & o ^ n, t, o, e[10], 17, 15, -42063), n = a((o ^ r) & t ^ r, n, t, e[11], 22, 10, -1990404162), r = a((t ^ o) & n ^ o, r, n, e[12], 7, 25, 1804603682), o = a((n ^ t) & r ^ t, o, r, e[13], 12, 20, -40341101), t = a((r ^ n) & o ^ n, t, o, e[14], 17, 15, -1502002290), n = a((o ^ r) & t ^ r, n, t, e[15], 22, 10, 1236535329), r = a((n ^ t) & o ^ t, r, n, e[1], 5, 27, -165796510), o = a((r ^ n) & t ^ n, o, r, e[6], 9, 23, -1069501632), t = a((o ^ r) & n ^ r, t, o, e[11], 14, 18, 643717713), n = a((t ^ o) & r ^ o, n, t, e[0], 20, 12, -373897302), r = a((n ^ t) & o ^ t, r, n, e[5], 5, 27, -701558691), o = a((r ^ n) & t ^ n, o, r, e[10], 9, 23, 38016083), t = a((o ^ r) & n ^ r, t, o, e[15], 14, 18, -660478335), n = a((t ^ o) & r ^ o, n, t, e[4], 20, 12, -405537848), r = a((n ^ t) & o ^ t, r, n, e[9], 5, 27, 568446438), o = a((r ^ n) & t ^ n, o, r, e[14], 9, 23, -1019803690), t = a((o ^ r) & n ^ r, t, o, e[3], 14, 18, -187363961), n = a((t ^ o) & r ^ o, n, t, e[8], 20, 12, 1163531501), r = a((n ^ t) & o ^ t, r, n, e[13], 5, 27, -1444681467), o = a((r ^ n) & t ^ n, o, r, e[2], 9, 23, -51403784), t = a((o ^ r) & n ^ r, t, o, e[7], 14, 18, 1735328473), n = a((t ^ o) & r ^ o, n, t, e[12], 20, 12, -1926607734), i = n ^ t, r = a(i ^ o, r, n, e[5], 4, 28, -378558), o = a(i ^ r, o, r, e[8], 11, 21, -2022574463), f = o ^ r, t = a(f ^ n, t, o, e[11], 16, 16, 1839030562), n = a(f ^ t, n, t, e[14], 23, 9, -35309556), i = n ^ t, r = a(i ^ o, r, n, e[1], 4, 28, -1530992060), o = a(i ^ r, o, r, e[4], 11, 21, 1272893353), f = o ^ r, t = a(f ^ n, t, o, e[7], 16, 16, -155497632), n = a(f ^ t, n, t, e[10], 23, 9, -1094730640), i = n ^ t, r = a(i ^ o, r, n, e[13], 4, 28, 681279174), o = a(i ^ r, o, r, e[0], 11, 21, -358537222), f = o ^ r, t = a(f ^ n, t, o, e[3], 16, 16, -722521979), n = a(f ^ t, n, t, e[6], 23, 9, 76029189), i = n ^ t, r = a(i ^ o, r, n, e[9], 4, 28, -640364487), o = a(i ^ r, o, r, e[12], 11, 21, -421815835), f = o ^ r, t = a(f ^ n, t, o, e[15], 16, 16, 530742520), n = a(f ^ t, n, t, e[2], 23, 9, -995338651), r = a(t ^ (n | ~o), r, n, e[0], 6, 26, -198630844), o = a(n ^ (r | ~t), o, r, e[7], 10, 22, 1126891415), t = a(r ^ (o | ~n), t, o, e[14], 15, 17, -1416354905), n = a(o ^ (t | ~r), n, t, e[5], 21, 11, -57434055), r = a(t ^ (n | ~o), r, n, e[12], 6, 26, 1700485571), o = a(n ^ (r | ~t), o, r, e[3], 10, 22, -1894986606), t = a(r ^ (o | ~n), t, o, e[10], 15, 17, -1051523), n = a(o ^ (t | ~r), n, t, e[1], 21, 11, -2054922799), r = a(t ^ (n | ~o), r, n, e[8], 6, 26, 1873313359), o = a(n ^ (r | ~t), o, r, e[15], 10, 22, -30611744), t = a(r ^ (o | ~n), t, o, e[6], 15, 17, -1560198380), n = a(o ^ (t | ~r), n, t, e[13], 21, 11, 1309151649), r = a(t ^ (n | ~o), r, n, e[4], 6, 26, -145523070), o = a(n ^ (r | ~t), o, r, e[11], 10, 22, -1120210379), t = a(r ^ (o | ~n), t, o, e[2], 15, 17, 718787259), n = a(o ^ (t | ~r), n, t, e[9], 21, 11, -343485551), y[0] = r, y[1] = n, y[2] = t, y[3] = o;
    }
    var u = [],
        d = [],
        A = [],
        h = [],
        l = "0123456789abcdef".split(""),
        C = [],
        g = [],
        s = !1,
        v = 0,
        w = 0,
        y = [];
    if (r.Int32Array)
      d = new Int32Array(16), A = new Int32Array(16), h = new Int32Array(4), C = new Int32Array(4), g = new Int32Array(4), y = new Int32Array(4);
    else {
      var I;
      for (I = 0; 16 > I; I++)
        d[I] = A[I] = 0;
      for (I = 0; 4 > I; I++)
        h[I] = C[I] = g[I] = y[I] = 0;
    }
    h[0] = 128, h[1] = 32768, h[2] = 8388608, h[3] = -2147483648, C[0] = 0, C[1] = 8, C[2] = 16, C[3] = 24, r.md5 = r.md5 || e;
  }("undefined" == typeof global ? window : global);
  bg.utils.md5 = md5;
})();
(function() {
  function generateUUID() {
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
  bg.utils.generateUUID = generateUUID;
})();

"use strict";
bg.app = {};

"use strict";
(function() {
  var Canvas = function() {
    function Canvas(domElem) {
      var $__2 = this;
      var initContext = function() {
        $__2._context = bg.utils.initWebGLContext(domElem);
        return $__2._context.supported;
      };
      this._domElem = domElem;
      this._domElem.style.MozUserSelect = 'none';
      this._domElem.style.WebkitUserSelect = 'none';
      this._domElem.setAttribute("onselectstart", "return false");
      this._multisample = 1.0;
      if (!initContext()) {
        throw new Error("Sorry, your browser does not support WebGL.");
      }
    }
    return ($traceurRuntime.createClass)(Canvas, {
      get multisample() {
        return this._multisample;
      },
      set multisample(ms) {
        this._multisample = ms;
      },
      get context() {
        return this._context;
      },
      get domElement() {
        return this._domElem;
      },
      get width() {
        return this._domElem.clientWidth;
      },
      get height() {
        return this._domElem.clientHeight;
      },
      screenshot: function(format, width, height) {
        var canvasStyle = "";
        var prevSize = {};
        if (width) {
          height = height ? height : width;
          canvasStyle = this.domElement.style.cssText;
          prevSize.width = this.domElement.width;
          prevSize.height = this.domElement.height;
          this.domElement.style.cssText = "top:auto;left:auto;bottom:auto;right:auto;width:" + width + "px;height:" + height + "px;";
          this.domElement.width = width;
          this.domElement.height = height;
          bg.app.MainLoop.singleton.windowController.reshape(width, height);
          bg.app.MainLoop.singleton.windowController.postRedisplay();
          bg.app.MainLoop.singleton.windowController.display();
        }
        var data = this.domElement.toDataURL(format);
        if (width) {
          this.domElement.style.cssText = canvasStyle;
          this.domElement.width = prevSize.width;
          this.domElement.height = prevSize.height;
          bg.app.MainLoop.singleton.windowController.reshape(prevSize.width, prevSize.height);
          bg.app.MainLoop.singleton.windowController.postRedisplay();
          bg.app.MainLoop.singleton.windowController.display();
        }
        return data;
      }
    }, {});
  }();
  bg.app.Canvas = Canvas;
  var ContextObject = function() {
    function ContextObject(context) {
      this._context = context;
    }
    return ($traceurRuntime.createClass)(ContextObject, {
      get context() {
        return this._context;
      },
      set context(c) {
        this._context = c;
      }
    }, {});
  }();
  bg.app.ContextObject = ContextObject;
})();

"use strict";
(function() {
  bg.app.SpecialKey = {
    BACKSPACE: "Backspace",
    TAB: "Tab",
    ENTER: "Enter",
    SHIFT: "Shift",
    SHIFT_LEFT: "ShiftLeft",
    SHIFT_RIGHT: "ShiftRight",
    CTRL: "Control",
    CTRL_LEFT: "ControlLeft",
    CTRL_LEFT: "ControlRight",
    ALT: "Alt",
    ALT_LEFT: "AltLeft",
    ALT_RIGHT: "AltRight",
    PAUSE: "Pause",
    CAPS_LOCK: "CapsLock",
    ESCAPE: "Escape",
    PAGE_UP: "PageUp",
    PAGEDOWN: "PageDown",
    END: "End",
    HOME: "Home",
    LEFT_ARROW: "ArrowLeft",
    UP_ARROW: "ArrowUp",
    RIGHT_ARROW: "ArrowRight",
    DOWN_ARROW: "ArrowDown",
    INSERT: "Insert",
    DELETE: "Delete"
  };
  var EventBase = function() {
    function EventBase() {
      this._executeDefault = false;
    }
    return ($traceurRuntime.createClass)(EventBase, {
      get executeDefault() {
        return this._executeDefault;
      },
      set executeDefault(d) {
        this._executeDefault = d;
      }
    }, {});
  }();
  bg.app.EventBase = EventBase;
  var KeyboardEvent = function($__super) {
    function KeyboardEvent(key, event) {
      $traceurRuntime.superConstructor(KeyboardEvent).call(this);
      this.key = key;
      this.event = event;
    }
    return ($traceurRuntime.createClass)(KeyboardEvent, {isSpecialKey: function() {
        return KeyboardEvent.IsSpecialKey(this.event);
      }}, {IsSpecialKey: function(event) {
        return bg.app.SpecialKey[event.code] != null;
      }}, $__super);
  }(EventBase);
  bg.app.KeyboardEvent = KeyboardEvent;
  bg.app.MouseButton = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2,
    NONE: -1
  };
  var MouseEvent = function($__super) {
    function MouseEvent() {
      var button = arguments[0] !== (void 0) ? arguments[0] : bg.app.MouseButton.NONE;
      var x = arguments[1] !== (void 0) ? arguments[1] : -1;
      var y = arguments[2] !== (void 0) ? arguments[2] : -1;
      var delta = arguments[3] !== (void 0) ? arguments[3] : 0;
      var event = arguments[4] !== (void 0) ? arguments[4] : null;
      $traceurRuntime.superConstructor(MouseEvent).call(this);
      this.button = button;
      this.x = x;
      this.y = y;
      this.delta = delta;
      this.event = event;
    }
    return ($traceurRuntime.createClass)(MouseEvent, {}, {}, $__super);
  }(EventBase);
  bg.app.MouseEvent = MouseEvent;
  var TouchEvent = function($__super) {
    function TouchEvent(touches, event) {
      $traceurRuntime.superConstructor(TouchEvent).call(this);
      this.touches = touches;
      this.event = event;
    }
    return ($traceurRuntime.createClass)(TouchEvent, {}, {}, $__super);
  }(EventBase);
  bg.app.TouchEvent = TouchEvent;
})();

"use strict";
(function() {
  var s_mainLoop = null;
  var s_mouseStatus = {
    leftButton: false,
    middleButton: false,
    rightButton: false,
    pos: {
      x: -1,
      y: -1
    }
  };
  Object.defineProperty(s_mouseStatus, "anyButton", {get: function() {
      return this.leftButton || this.middleButton || this.rightButton;
    }});
  var s_delta = -1;
  var Mouse = function() {
    function Mouse() {}
    return ($traceurRuntime.createClass)(Mouse, {}, {
      LeftButton: function() {
        return s_mouseStatus.leftButton;
      },
      MiddleButton: function() {
        return s_mouseStatus.middleButton;
      },
      RightButton: function() {
        return s_mouseStatus.rightButton;
      },
      Position: function() {
        return s_mouseStatus.pos;
      }
    });
  }();
  bg.app.Mouse = Mouse;
  bg.app.FrameUpdate = {
    AUTO: 0,
    MANUAL: 1
  };
  var MainLoop = function() {
    function MainLoop() {
      var $__3 = this;
      this._canvas = null;
      this._windowController = null;
      this._updateMode = bg.app.FrameUpdate.AUTO;
      this._redisplayFrames = 1;
      bg.bindImageLoadEvent(function() {
        $__3.postRedisplay();
      });
    }
    return ($traceurRuntime.createClass)(MainLoop, {
      get canvas() {
        return this._canvas;
      },
      set canvas(c) {
        this._canvas = new bg.app.Canvas(c);
      },
      get windowController() {
        return this._windowController;
      },
      get updateMode() {
        return this._updateMode;
      },
      set updateMode(m) {
        this._updateMode = m;
        if (this._updateMode == bg.app.FrameUpdate.AUTO) {
          this._redisplayFrames = 1;
        }
      },
      get redisplay() {
        return this._redisplayFrames > 0;
      },
      get mouseButtonStatus() {
        return s_mouseStatus;
      },
      run: function(windowController) {
        this._windowController = windowController;
        this.postRedisplay();
        this.windowController.init();
        initEvents();
        animationLoop();
      },
      postRedisplay: function() {
        var frames = arguments[0] !== (void 0) ? arguments[0] : 1;
        this._redisplayFrames = frames;
      },
      postReshape: function() {
        onResize();
      }
    }, {});
  }();
  function animationLoop() {
    requestAnimFrame(animationLoop);
    onUpdate();
  }
  function initEvents() {
    onResize();
    window.addEventListener("resize", function(evt) {
      onResize();
    });
    if (s_mainLoop.canvas) {
      var c = s_mainLoop.canvas.domElement;
      c.addEventListener("mousedown", function(evt) {
        if (!onMouseDown(evt).executeDefault) {
          evt.preventDefault();
          return false;
        }
      });
      c.addEventListener("mousemove", function(evt) {
        if (!onMouseMove(evt).executeDefault) {
          evt.preventDefault();
          return false;
        }
      });
      c.addEventListener("mouseout", function(evt) {
        if (!onMouseOut(evt).executeDefault) {
          evt.preventDefault();
          return false;
        }
      });
      c.addEventListener("mouseover", function(evt) {
        if (!onMouseOver(evt).executeDefault) {
          evt.preventDefault();
          return false;
        }
      });
      c.addEventListener("mouseup", function(evt) {
        if (!onMouseUp(evt).executeDefault) {
          evt.preventDefault();
          return false;
        }
      });
      c.addEventListener("touchstart", function(evt) {
        if (!onTouchStart(evt).executeDefault) {
          evt.preventDefault();
          return false;
        }
      });
      c.addEventListener("touchmove", function(evt) {
        if (!onTouchMove(evt).executeDefault) {
          evt.preventDefault();
          return false;
        }
      });
      c.addEventListener("touchend", function(evt) {
        if (!onTouchEnd(evt).executeDefault) {
          evt.preventDefault();
          return false;
        }
      });
      var mouseWheelEvt = (/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel";
      c.addEventListener(mouseWheelEvt, function(evt) {
        if (!onMouseWheel(evt).executeDefault) {
          evt.preventDefault();
          return false;
        }
      });
      window.addEventListener("keydown", function(evt) {
        onKeyDown(evt);
      });
      window.addEventListener("keyup", function(evt) {
        onKeyUp(evt);
      });
      c.oncontextmenu = function(e) {
        return false;
      };
    } else {
      throw new Error("Configuration error in MainLoop: no canvas defined");
    }
  }
  function onResize() {
    if (s_mainLoop.canvas && s_mainLoop.windowController) {
      var multisample = s_mainLoop.canvas.multisample;
      s_mainLoop.canvas.domElement.width = s_mainLoop.canvas.width * multisample;
      s_mainLoop.canvas.domElement.height = s_mainLoop.canvas.height * multisample;
      s_mainLoop.windowController.reshape(s_mainLoop.canvas.width * multisample, s_mainLoop.canvas.height * multisample);
    }
  }
  function onUpdate() {
    if (s_mainLoop.redisplay) {
      if (s_delta == -1)
        s_delta = Date.now();
      s_mainLoop.windowController.frame(Date.now() - s_delta);
      s_mainLoop.windowController.display();
      s_delta = Date.now();
      if (s_mainLoop.updateMode == bg.app.FrameUpdate.AUTO) {
        s_mainLoop._redisplayFrames = 1;
      } else {
        s_mainLoop._redisplayFrames--;
      }
    }
  }
  function onMouseDown(event) {
    var offset = s_mainLoop.canvas.domElement.getBoundingClientRect();
    var multisample = s_mainLoop.canvas.multisample;
    s_mouseStatus.pos.x = (event.clientX - offset.left) * multisample;
    s_mouseStatus.pos.y = (event.clientY - offset.top) * multisample;
    switch (event.button) {
      case bg.app.MouseButton.LEFT:
        s_mouseStatus.leftButton = true;
        break;
      case bg.app.MouseButton.MIDDLE:
        s_mouseStatus.middleButton = true;
        break;
      case bg.app.MouseButton.RIGHT:
        s_mouseStatus.rightButton = true;
        break;
    }
    var bgEvent = new bg.app.MouseEvent(event.button, s_mouseStatus.pos.x, s_mouseStatus.pos.y, 0, event);
    s_mainLoop.windowController.mouseDown(bgEvent);
    return bgEvent;
  }
  function onMouseMove(event) {
    var offset = s_mainLoop.canvas.domElement.getBoundingClientRect();
    var multisample = s_mainLoop.canvas.multisample;
    s_mouseStatus.pos.x = (event.clientX - offset.left) * multisample;
    s_mouseStatus.pos.y = (event.clientY - offset.top) * multisample;
    var evt = new bg.app.MouseEvent(bg.app.MouseButton.NONE, s_mouseStatus.pos.x, s_mouseStatus.pos.y, 0, event);
    s_mainLoop.windowController.mouseMove(evt);
    if (s_mouseStatus.anyButton) {
      s_mainLoop.windowController.mouseDrag(evt);
    }
    return evt;
  }
  function onMouseOut() {
    var bgEvt = new bg.app.MouseEvent(bg.app.MouseButton.NONE, s_mouseStatus.pos.x, s_mouseStatus.pos.y, 0, {});
    s_mainLoop.windowController.mouseOut(bgEvt);
    if (s_mouseStatus.leftButton) {
      s_mouseStatus.leftButton = false;
      bgEvt = new bg.app.MouseEvent(bg.app.MouseButton.LEFT, s_mouseStatus.pos.x, s_mouseStatus.pos.y, 0, {});
      s_mainLoop.windowController.mouseUp(bgEvt);
    }
    if (s_mouseStatus.middleButton) {
      s_mouseStatus.middleButton = false;
      bgEvt = new bg.app.MouseEvent(bg.app.MouseButton.MIDDLE, s_mouseStatus.pos.x, s_mouseStatus.pos.y, 0, {});
      s_mainLoop.windowController.mouseUp(bgEvt);
    }
    if (s_mouseStatus.rightButton) {
      bgEvt = new bg.app.MouseEvent(bg.app.MouseButton.RIGHT, s_mouseStatus.pos.x, s_mouseStatus.pos.y, 0, {});
      s_mainLoop.windowController.mouseUp(bgEvt);
      s_mouseStatus.rightButton = false;
    }
    return bgEvt;
  }
  function onMouseOver(event) {
    return onMouseMove(event);
  }
  function onMouseUp(event) {
    switch (event.button) {
      case bg.app.MouseButton.LEFT:
        s_mouseStatus.leftButton = false;
        break;
      case bg.app.MouseButton.MIDDLE:
        s_mouseStatus.middleButton = false;
        break;
      case bg.app.MouseButton.RIGHT:
        s_mouseStatus.rightButton = false;
        break;
    }
    var offset = s_mainLoop.canvas.domElement.getBoundingClientRect();
    var multisample = s_mainLoop.canvas.multisample;
    s_mouseStatus.pos.x = (event.clientX - offset.left) * multisample;
    s_mouseStatus.pos.y = (event.clientY - offset.top) * multisample;
    var bgEvt = new bg.app.MouseEvent(event.button, s_mouseStatus.pos.x, s_mouseStatus.pos.y, 0, event);
    s_mainLoop.windowController.mouseUp(bgEvt);
    return bgEvt;
  }
  function onMouseWheel(event) {
    var offset = s_mainLoop.canvas.domElement.getBoundingClientRect();
    var multisample = s_mainLoop.canvas.multisample;
    s_mouseStatus.pos.x = (event.clientX - offset.left) * multisample;
    s_mouseStatus.pos.y = (event.clientY - offset.top) * multisample;
    var delta = event.wheelDelta ? event.wheelDelta * -1 : event.detail * 10;
    var bgEvt = new bg.app.MouseEvent(bg.app.MouseButton.NONE, s_mouseStatus.pos.x, s_mouseStatus.pos.y, delta, event);
    s_mainLoop.windowController.mouseWheel(bgEvt);
    return bgEvt;
  }
  function getTouchEvent(event) {
    var offset = s_mainLoop.canvas.domElement.getBoundingClientRect();
    var touches = [];
    for (var i = 0; i < event.touches.length; ++i) {
      var touch = event.touches[i];
      touches.push({
        identifier: touch.identifier,
        x: touch.clientX - offset.left,
        y: touch.clientY - offset.top,
        force: touch.force,
        rotationAngle: touch.rotationAngle,
        radiusX: touch.radiusX,
        radiusY: touch.radiusY
      });
    }
    return new bg.app.TouchEvent(touches, event);
  }
  function onTouchStart(event) {
    var bgEvt = getTouchEvent(event);
    s_mainLoop.windowController.touchStart(bgEvt);
    return bgEvt;
  }
  function onTouchMove(event) {
    var bgEvt = getTouchEvent(event);
    s_mainLoop.windowController.touchMove(bgEvt);
    return bgEvt;
  }
  function onTouchEnd(event) {
    var bgEvt = getTouchEvent(event);
    s_mainLoop.windowController.touchEnd(bgEvt);
    return bgEvt;
  }
  function onKeyDown(event) {
    var code = bg.app.KeyboardEvent.IsSpecialKey(event) ? event.keyCode : event.code;
    s_mainLoop.windowController.keyDown(new bg.app.KeyboardEvent(code, event));
  }
  function onKeyUp(event) {
    var code = bg.app.KeyboardEvent.IsSpecialKey(event) ? event.keyCode : event.code;
    s_mainLoop.windowController.keyUp(new bg.app.KeyboardEvent(code, event));
  }
  bg.app.MainLoop = {};
  Object.defineProperty(bg.app.MainLoop, "singleton", {get: function() {
      if (!s_mainLoop) {
        s_mainLoop = new MainLoop();
      }
      return s_mainLoop;
    }});
})();

"use strict";
(function() {
  var WindowController = function($__super) {
    function WindowController() {
      $traceurRuntime.superConstructor(WindowController).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(WindowController, {
      postRedisplay: function() {
        var frames = arguments[0] !== (void 0) ? arguments[0] : 1;
        bg.app.MainLoop.singleton.postRedisplay(frames);
      },
      postReshape: function() {
        bg.app.MainLoop.singleton.postReshape();
      },
      get canvas() {
        return bg.app.MainLoop.singleton.canvas;
      },
      get context() {
        return bg.app.MainLoop.singleton.canvas.context;
      },
      get gl() {
        return bg.app.MainLoop.singleton.canvas.context.gl;
      }
    }, {}, $__super);
  }(bg.LifeCycle);
  bg.app.WindowController = WindowController;
})();

"use strict";
bg.base = {};
bg.s_log = [];
bg.log = function(l) {
  if (console.log)
    console.log(l);
  bg.s_log.push(l);
};
bg.flushLog = function() {
  if (console.log) {
    bg.s_log.forEach(function(l) {
      console.log(l);
    });
  }
  bg.s_log = [];
};
bg.emitImageLoadEvent = function(img) {
  var event = new CustomEvent("bg2e:image-load", {image: img});
  document.dispatchEvent(event);
};
bg.bindImageLoadEvent = function(callback) {
  document.addEventListener("bg2e:image-load", callback);
};
bg.Axis = {
  NONE: 0,
  X: 1,
  Y: 2,
  Z: 3
};
Object.defineProperty(bg, "isElectronApp", {get: function() {
    return typeof module !== 'undefined' && module.exports && true;
  }});

"use strict";
(function() {
  var Effect = function($__super) {
    function Effect(context) {
      $traceurRuntime.superConstructor(Effect).call(this, context);
      this._shader = null;
      this._inputVars = [];
    }
    return ($traceurRuntime.createClass)(Effect, {
      get inputVars() {
        return this._inputVars;
      },
      get shader() {
        return this._shader;
      },
      setupShaderSource: function(sourceArray) {
        var $__3 = this;
        this._shader = new bg.base.Shader(this.context);
        this._inputVars = [];
        var inputAttribs = [];
        var inputVars = [];
        sourceArray.forEach(function(source) {
          source.params.forEach(function(param) {
            if (param) {
              if (param.role == "buffer") {
                $__3._inputVars[param.target] = param.name;
                inputAttribs.push(param.name);
              } else if (param.role == "value") {
                inputVars.push(param.name);
              }
            }
          });
          $__3._shader.addShaderSource(source.type, source.toString());
        });
        this._shader.link();
        if (!this._shader.status) {
          bg.log(this._shader.compileError);
          if (this._shader.compileErrorSource) {
            bg.log("Shader source:");
            bg.log(this._shader.compileErrorSource);
          }
          bg.log(this._shader.linkError);
        } else {
          this._shader.initVars(inputAttribs, inputVars);
        }
      },
      beginDraw: function() {},
      setupVars: function() {},
      setActive: function() {
        this.shader.setActive();
        this.beginDraw();
      },
      clearActive: function() {
        this.shader.clearActive();
      },
      bindPolyList: function(plist) {
        var s = this.shader;
        if (this.inputVars.vertex) {
          s.setInputBuffer(this.inputVars.vertex, plist.vertexBuffer, 3);
        }
        if (this.inputVars.normal) {
          s.setInputBuffer(this.inputVars.normal, plist.normalBuffer, 3);
        }
        if (this.inputVars.tex0) {
          s.setInputBuffer(this.inputVars.tex0, plist.texCoord0Buffer, 2);
        }
        if (this.inputVars.tex1) {
          s.setInputBuffer(this.inputVars.tex1, plist.texCoord1Buffer, 2);
        }
        if (this.inputVars.tex2) {
          s.setInputBuffer(this.inputVars.tex2, plist.texCoord2Buffer, 2);
        }
        if (this.inputVars.color) {
          s.setInputBuffer(this.inputVars.color, plist.colorBuffer, 4);
        }
        if (this.inputVars.tangent) {
          s.setInputBuffer(this.inputVars.tangent, plist.tangentBuffer, 3);
        }
        this.setupVars();
      },
      unbind: function() {
        var s = this.shader;
        if (this.inputVars.vertex) {
          s.disableInputBuffer(this.inputVars.vertex);
        }
        if (this.inputVars.normal) {
          s.disableInputBuffer(this.inputVars.normal);
        }
        if (this.inputVars.tex0) {
          s.disableInputBuffer(this.inputVars.tex0);
        }
        if (this.inputVars.tex1) {
          s.disableInputBuffer(this.inputVars.tex1);
        }
        if (this.inputVars.tex2) {
          s.disableInputBuffer(this.inputVars.tex2);
        }
        if (this.inputVars.color) {
          s.disableInputBuffer(this.inputVars.color);
        }
        if (this.inputVars.tangent) {
          s.disableInputBuffer(this.inputVars.tangent);
        }
      }
    }, {}, $__super);
  }(bg.app.ContextObject);
  bg.base.Effect = Effect;
  function lib() {
    return bg.base.ShaderLibrary.Get();
  }
  var TextureEffect = function($__super) {
    function TextureEffect(context) {
      $traceurRuntime.superConstructor(TextureEffect).call(this, context);
      this._frame = new bg.base.PolyList(context);
      this._frame.vertex = [1, 1, 0, -1, 1, 0, -1, -1, 0, 1, -1, 0];
      this._frame.texCoord0 = [1, 1, 0, 1, 0, 0, 1, 0];
      this._frame.index = [0, 1, 2, 2, 3, 0];
      this._frame.build();
      this.rebuildShaders();
    }
    return ($traceurRuntime.createClass)(TextureEffect, {
      rebuildShaders: function() {
        this.setupShaderSource([this.vertexShaderSource, this.fragmentShaderSource]);
      },
      get vertexShaderSource() {
        if (!this._vertexShaderSource) {
          this._vertexShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
          this._vertexShaderSource.addParameter([lib().inputs.buffers.vertex, lib().inputs.buffers.tex0, {
            name: "fsTexCoord",
            dataType: "vec2",
            role: "out"
          }]);
          if (bg.Engine.Get().id == "webgl1") {
            this._vertexShaderSource.setMainBody("\n\t\t\t\t\tgl_Position = vec4(inVertex,1.0);\n\t\t\t\t\tfsTexCoord = inTex0;");
          }
        }
        return this._vertexShaderSource;
      },
      get fragmentShaderSource() {
        if (!this._fragmentShaderSource) {
          this._fragmentShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
          this._fragmentShaderSource.addParameter({
            name: "fsTexCoord",
            dataType: "vec2",
            role: "in"
          });
          if (bg.Engine.Get().id == "webgl1") {
            this._fragmentShaderSource.setMainBody("\n\t\t\t\t\tgl_FragColor = vec4(1.0,0.0,0.0,1.0);");
          }
        }
        return this._fragmentShaderSource;
      },
      drawSurface: function(surface) {
        this.setActive();
        this._surface = surface;
        this.bindPolyList(this._frame);
        this._frame.draw();
        this.unbind();
        this.clearActive();
      }
    }, {}, $__super);
  }(Effect);
  bg.base.TextureEffect = TextureEffect;
})();

"use strict";
(function() {
  var LoaderPlugin = function() {
    function LoaderPlugin() {}
    return ($traceurRuntime.createClass)(LoaderPlugin, {
      acceptType: function(url, data) {
        return false;
      },
      load: function(context, url, data) {
        return new Promise(function(resolve, reject) {
          reject(new Error("Not implemented"));
        });
      }
    }, {});
  }();
  bg.base.LoaderPlugin = LoaderPlugin;
  var s_loaderPlugins = [];
  function loadUrl(context, url) {
    var onProgress = arguments[2] !== (void 0) ? arguments[2] : null;
    var extraData = arguments[3] !== (void 0) ? arguments[3] : null;
    return new Promise(function(accept, reject) {
      bg.utils.Resource.Load(url, onProgress).then(function(data) {
        return Loader.LoadData(context, url, data, extraData);
      }).then(function(result, extendedData) {
        accept(result, extendedData);
      }).catch(function(err) {
        reject(err);
      });
    });
  }
  function loadUrlArray(context, url) {
    var onProgress = arguments[2] !== (void 0) ? arguments[2] : null;
    var extraData = arguments[3] !== (void 0) ? arguments[3] : null;
    return new Promise(function(accept, reject) {
      bg.utils.Resource.LoadMultiple(url, onProgress).then(function(result) {
        var promises = [];
        for (var itemUrl in result) {
          var data = result[itemUrl];
          promises.push(loadData(context, itemUrl, data, extraData));
        }
        return Promise.all(promises);
      }).then(function(loadedResults) {
        var resolvedData = {};
        url.forEach(function(itemUrl, index) {
          resolvedData[itemUrl] = loadedResults[index];
        });
        accept(resolvedData);
      }).catch(function(err) {
        reject(err);
      });
    });
  }
  function loadData(context, url, data) {
    var extraData = arguments[3] !== (void 0) ? arguments[3] : null;
    return new Promise(function(accept, reject) {
      var selectedPlugin = null;
      s_loaderPlugins.some(function(plugin) {
        if (plugin.acceptType(url, data)) {
          selectedPlugin = plugin;
          return true;
        }
      });
      if (selectedPlugin) {
        if (!extraData) {
          extraData = {};
        }
        accept(selectedPlugin.load(context, url, data, extraData));
      } else {
        return reject(new Error("No suitable plugin found for load " + url));
      }
    });
  }
  var Loader = function() {
    function Loader() {}
    return ($traceurRuntime.createClass)(Loader, {}, {
      RegisterPlugin: function(p) {
        s_loaderPlugins.push(p);
      },
      Load: function(context, url) {
        var onProgress = arguments[2] !== (void 0) ? arguments[2] : null;
        var extraData = arguments[3] !== (void 0) ? arguments[3] : null;
        if (Array.isArray(url)) {
          return loadUrlArray(context, url, onProgress, extraData);
        } else {
          return loadUrl(context, url, onProgress, extraData);
        }
      },
      LoadData: function(context, url, data) {
        var extraData = arguments[3] !== (void 0) ? arguments[3] : null;
        return loadData(context, url, data, extraData);
      }
    });
  }();
  bg.base.Loader = Loader;
})();

"use strict";
(function() {
  if (!bg.isElectronApp) {
    return false;
  }
  var WriterPlugin = function() {
    function WriterPlugin() {}
    return ($traceurRuntime.createClass)(WriterPlugin, {
      acceptType: function(url, data) {
        return false;
      },
      write: function(url, data) {}
    }, {});
  }();
  bg.base.WriterPlugin = WriterPlugin;
  var s_writerPlugins = [];
  var Writer = function() {
    function Writer() {}
    return ($traceurRuntime.createClass)(Writer, {}, {
      RegisterPlugin: function(p) {
        s_writerPlugins.push(p);
      },
      Write: function(url, data) {
        return new Promise(function(resolve, reject) {
          var selectedPlugin = null;
          s_writerPlugins.some(function(plugin) {
            if (plugin.acceptType(url, data)) {
              selectedPlugin = plugin;
              return true;
            }
          });
          if (selectedPlugin) {
            resolve(selectedPlugin.write(url, data));
          } else {
            reject(new Error("No suitable plugin found for write " + url));
          }
        });
      },
      PrepareDirectory: function(dir) {
        var targetDir = Writer.ToSystemPath(dir);
        var fs = require('fs');
        var path = require('path');
        var sep = path.sep;
        var initDir = path.isAbsolute(targetDir) ? sep : '';
        targetDir.split(sep).reduce(function(parentDir, childDir) {
          var curDir = path.resolve(parentDir, childDir);
          if (!fs.existsSync(curDir)) {
            fs.mkdirSync(curDir);
          }
          return curDir;
        }, initDir);
      },
      StandarizePath: function(inPath) {
        return inPath.replace(/\\/g, '/');
      },
      ToSystemPath: function(inPath) {
        var path = require('path');
        var sep = path.sep;
        return inPath.replace(/\\/g, sep).replace(/\//g, sep);
      },
      CopyFile: function(source, target) {
        return new Promise(function(resolve, reject) {
          var fs = require("fs");
          var path = require("path");
          var cbCalled = false;
          source = Writer.StandarizePath(path.resolve(source));
          target = Writer.StandarizePath(path.resolve(target));
          if (source == target) {
            resolve();
          } else {
            var done = function(err) {
              if (!cbCalled) {
                err ? reject(err) : resolve();
                cbCalled = true;
              }
            };
            var rd = fs.createReadStream(source);
            rd.on("error", function(err) {
              done(err);
            });
            var wr = fs.createWriteStream(target);
            wr.on("error", function(err) {
              done(err);
            });
            wr.on("close", function(ex) {
              done();
            });
            rd.pipe(wr);
          }
        });
      }
    });
  }();
  bg.base.Writer = Writer;
})();

"use strict";
(function() {
  if (!bg.isElectronApp) {
    return false;
  }
  var fs = require('fs');
  var path = require('path');
  function writeTexture(texture, fileData) {
    if (texture) {
      var dstPath = bg.base.Writer.StandarizePath(fileData.path).split("/");
      dstPath.pop();
      var srcFileName = texture.fileName.split("/").pop();
      dstPath.push(srcFileName);
      dstPath = dstPath.join("/");
      var paths = {
        src: texture.fileName,
        dst: dstPath
      };
      if (paths.src != paths.dst) {
        fileData.copyFiles.push(paths);
      }
      return srcFileName;
    } else {
      return "";
    }
  }
  function getMaterialString(fileData) {
    var mat = [];
    fileData.node.drawable.forEach(function(plist, material) {
      mat.push({
        "name": plist.name,
        "class": "GenericMaterial",
        "diffuseR": material.diffuse.r,
        "diffuseG": material.diffuse.g,
        "diffuseB": material.diffuse.b,
        "diffuseA": material.diffuse.a,
        "specularR": material.specular.r,
        "specularG": material.specular.g,
        "specularB": material.specular.b,
        "specularA": material.specular.a,
        "shininess": material.shininess,
        "refractionAmount": material.refractionAmount,
        "reflectionAmount": material.reflectionAmount,
        "lightEmission": material.lightEmission,
        "textureOffsetX": material.textureOffset.x,
        "textureOffsetY": material.textureOffset.y,
        "textureScaleX": material.textureScale.x,
        "textureScaleY": material.textureScale.y,
        "lightmapOffsetX": material.lightmapOffset.x,
        "lightmapOffsetY": material.lightmapOffset.y,
        "lightmapScaleX": material.lightmapScale.x,
        "lightmapScaleY": material.lightmapScale.y,
        "normalMapOffsetX": material.normalMapOffset.x,
        "normalMapOffsetY": material.normalMapOffset.y,
        "normalMapScaleX": material.normalMapScale.x,
        "normalMapScaleY": material.normalMapScale.y,
        "castShadows": material.castShadows,
        "receiveShadows": material.receiveShadows,
        "alphaCutoff": material.alphaCutoff,
        "shininessMaskChannel": material.shininessMaskChannel,
        "invertShininessMask": material.shininessMaskInvert,
        "lightEmissionMaskChannel": material.lightEmissionMaskChannel,
        "invertLightEmissionMask": material.lightEmissionMaskInvert,
        "displacementFactor": 0,
        "displacementUV": 0,
        "tessDistanceFarthest": 40.0,
        "tessDistanceFar": 30.0,
        "tessDistanceNear": 15.0,
        "tessDistanceNearest": 8.0,
        "tessFarthestLevel": 1,
        "tessFarLevel": 1,
        "tessNearLevel": 1,
        "tessNearestLevel": 1,
        "reflectionMaskChannel": material.reflectionMaskChannel,
        "invertReflectionMask": material.reflectionMaskInvert,
        "roughness": material.roughness,
        "roughnessMaskChannel": material.roughnessMaskChannel,
        "invertRoughnessMask": material.roughnessMaskInvert,
        "cullFace": material.cullFace,
        "unlit": material.unlit,
        "texture": writeTexture(material.texture, fileData),
        "lightmap": writeTexture(material.lightmap, fileData),
        "normalMap": writeTexture(material.normalMap, fileData),
        "shininessMask": writeTexture(material.shininessMask, fileData),
        "lightEmissionMask": writeTexture(material.lightEmissionMask, fileData),
        "displacementMap": "",
        "reflectionMask": writeTexture(material.reflectionMask, fileData),
        "roughnessMask": writeTexture(material.roughnessMask, fileData),
        "visible": plist.visible,
        "groupName": material.groupName
      });
    });
    return JSON.stringify(mat);
  }
  function getJointString(fileData) {
    var joints = {};
    var inJoint = fileData.node.component("bg.scene.InputChainJoint");
    var outJoint = fileData.node.component("bg.scene.OutputChainJoint");
    if (inJoint) {
      joints.input = {
        "type": "LinkJoint",
        "offset": [inJoint.joint.offset.x, inJoint.joint.offset.y, inJoint.joint.offset.z],
        "pitch": inJoint.joint.pitch,
        "roll": inJoint.joint.roll,
        "yaw": inJoint.joint.yaw
      };
    }
    if (outJoint) {
      joints.output = [{
        "type": "LinkJoint",
        "offset": [outJoint.joint.offset.x, outJoint.joint.offset.y, outJoint.joint.offset.z],
        "pitch": outJoint.joint.pitch,
        "roll": outJoint.joint.roll,
        "yaw": outJoint.joint.yaw
      }];
    }
    return JSON.stringify(joints);
  }
  function ensurePolyListName(fileData) {
    var plistNames = [];
    var plIndex = 0;
    fileData.node.drawable.forEach(function(plist, matName) {
      var plName = plist.name;
      if (!plName || plistNames.indexOf(plName) != -1) {
        do {
          plName = "polyList_" + plIndex;
          ++plIndex;
        } while (plistNames.indexOf(plName) != -1);
        plist.name = plName;
      }
      plistNames.push(plName);
    });
  }
  var FileData = function() {
    function FileData(path, node) {
      this._path = path;
      this._node = node;
      this._copyFiles = [];
      this._stream = fs.createWriteStream(path);
    }
    return ($traceurRuntime.createClass)(FileData, {
      get path() {
        return this._path;
      },
      get node() {
        return this._node;
      },
      get copyFiles() {
        return this._copyFiles;
      },
      get stream() {
        return this._stream;
      },
      writeUInt: function(number) {
        var buffer = new Buffer(4);
        buffer.writeUInt32BE(number, 0);
        this.stream.write(buffer);
      },
      writeBlock: function(blockName) {
        this.stream.write(Buffer.from(blockName, "utf-8"));
      },
      writeString: function(stringData) {
        this.writeUInt(stringData.length);
        this.stream.write(Buffer.from(stringData, "utf-8"));
      },
      writeBuffer: function(name, arrayBuffer) {
        this.writeBlock(name);
        this.writeUInt(arrayBuffer.length);
        var buffer = new Buffer(4 * arrayBuffer.length);
        if (name == "indx") {
          arrayBuffer.forEach(function(d, i) {
            return buffer.writeUInt32BE(d, i * 4);
          });
        } else {
          arrayBuffer.forEach(function(d, i) {
            return buffer.writeFloatBE(d, i * 4);
          });
        }
        this.stream.write(buffer);
      },
      writeTextures: function() {
        var promises = [];
        this.copyFiles.forEach(function(copyData) {
          promises.push(new Promise(function(resolve) {
            var rd = fs.createReadStream(copyData.src);
            rd.on('error', rejectCleanup);
            var wr = fs.createWriteStream(copyData.dst);
            wr.on('error', rejectCleanup);
            function rejectCleanup(err) {
              rd.destroy();
              wr.end();
              reject(err);
            }
            wr.on('finish', resolve);
            rd.pipe(wr);
          }));
        });
        return Promise.all(promises);
      }
    }, {});
  }();
  function writeHeader(fileData) {
    var buffer = new Buffer(4);
    [0, 1, 2, 0].forEach(function(d, i) {
      return buffer.writeInt8(d, i);
    });
    fileData.stream.write(buffer);
    fileData.writeBlock("hedr");
    ensurePolyListName(fileData);
    var drw = fileData.node.drawable;
    var plistItems = 0;
    drw.forEach(function() {
      return plistItems++;
    });
    fileData.writeUInt(plistItems);
    fileData.writeBlock("mtrl");
    fileData.writeString(getMaterialString(fileData));
    fileData.writeBlock("join");
    fileData.writeString(getJointString(fileData));
  }
  function writePolyList(fileData, plist, material, trx) {
    fileData.writeBlock("plst");
    fileData.writeBlock("pnam");
    fileData.writeString(plist.name);
    fileData.writeBlock("mnam");
    fileData.writeString(plist.name);
    fileData.writeBuffer("varr", plist.vertex);
    fileData.writeBuffer("narr", plist.normal);
    fileData.writeBuffer("t0ar", plist.texCoord0);
    fileData.writeBuffer("t1ar", plist.texCoord1);
    fileData.writeBuffer("indx", plist.index);
  }
  function writeNode(fileData) {
    writeHeader(fileData);
    fileData.node.drawable.forEach(function(plist, mat, trx) {
      writePolyList(fileData, plist, mat, trx);
    });
    fileData.writeBlock("endf");
    fileData.stream.end();
  }
  var Bg2WriterPlugin = function($__super) {
    function Bg2WriterPlugin() {
      $traceurRuntime.superConstructor(Bg2WriterPlugin).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(Bg2WriterPlugin, {
      acceptType: function(url, data) {
        var ext = url.split(".").pop();
        return /bg2/i.test(ext) || /vwglb/i.test(ext);
      },
      write: function(url, data) {
        return new Promise(function(resolve, reject) {
          if (!data || !data instanceof bg.scene.Node || !data.drawable) {
            reject(new Error("Invalid data format. Expecting scene node."));
          }
          var fileData = new FileData(url, data);
          try {
            writeNode(fileData);
            fileData.writeTextures().then(function() {
              return resolve();
            }).catch(function(err) {
              return reject(err);
            });
          } catch (err) {
            reject(err);
          }
        });
      }
    }, {}, $__super);
  }(bg.base.WriterPlugin);
  bg.base.Bg2WriterPlugin = Bg2WriterPlugin;
})();

"use strict";
(function() {
  var Bg2matLoaderPlugin = function($__super) {
    function Bg2matLoaderPlugin() {
      $traceurRuntime.superConstructor(Bg2matLoaderPlugin).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(Bg2matLoaderPlugin, {
      acceptType: function(url, data) {
        return bg.utils.Resource.GetExtension(url) == "bg2mat";
      },
      load: function(context, url, data) {
        return new Promise(function(resolve, reject) {
          if (data) {
            try {
              if (typeof(data) == "string") {
                data = JSON.parse(data);
              }
              var promises = [];
              var basePath = url.substring(0, url.lastIndexOf('/') + 1);
              data.forEach(function(matData) {
                promises.push(bg.base.Material.FromMaterialDefinition(context, matData, basePath));
              });
              Promise.all(promises).then(function(result) {
                resolve(result);
              });
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error("Error loading material. Data is null."));
          }
        });
      }
    }, {}, $__super);
  }(bg.base.LoaderPlugin);
  bg.base.Bg2matLoaderPlugin = Bg2matLoaderPlugin;
})();

"use strict";
(function() {
  function lib() {
    return bg.base.ShaderLibrary.Get();
  }
  var DrawTextureEffect = function($__super) {
    function DrawTextureEffect(context) {
      $traceurRuntime.superConstructor(DrawTextureEffect).call(this, context);
      var vertex = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
      var fragment = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
      vertex.addParameter([lib().inputs.buffers.vertex, lib().inputs.buffers.tex0, {
        name: "fsTexCoord",
        dataType: "vec2",
        role: "out"
      }]);
      fragment.addParameter([lib().inputs.material.texture, {
        name: "fsTexCoord",
        dataType: "vec2",
        role: "in"
      }]);
      if (bg.Engine.Get().id == "webgl1") {
        vertex.setMainBody("\n\t\t\t\tgl_Position = vec4(inVertex,1.0);\n\t\t\t\tfsTexCoord = inTex0;");
        fragment.setMainBody("gl_FragColor = texture2D(inTexture,fsTexCoord);");
      }
      this.setupShaderSource([vertex, fragment]);
    }
    return ($traceurRuntime.createClass)(DrawTextureEffect, {setupVars: function() {
        var texture = null;
        if (this._surface instanceof bg.base.Texture) {
          texture = this._surface;
        } else if (this._surface instanceof bg.base.RenderSurface) {
          texture = this._surface.getTexture(0);
        }
        if (texture) {
          this.shader.setTexture("inTexture", texture, bg.base.TextureUnit.TEXTURE_0);
        }
      }}, {}, $__super);
  }(bg.base.TextureEffect);
  bg.base.DrawTextureEffect = DrawTextureEffect;
})();

"use strict";
(function() {
  var shaders = {};
  function lib() {
    return bg.base.ShaderLibrary.Get();
  }
  var s_vertexSource = null;
  var s_fragmentSource = null;
  function vertexShaderSource() {
    if (!s_vertexSource) {
      s_vertexSource = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
      s_vertexSource.addParameter([lib().inputs.buffers.vertex, lib().inputs.buffers.normal, lib().inputs.buffers.tangent, lib().inputs.buffers.tex0, lib().inputs.buffers.tex1]);
      s_vertexSource.addParameter(lib().inputs.matrix.all);
      s_vertexSource.addParameter([{
        name: "inLightProjectionMatrix",
        dataType: "mat4",
        role: "value"
      }, {
        name: "inLightViewMatrix",
        dataType: "mat4",
        role: "value"
      }]);
      s_vertexSource.addParameter([{
        name: "fsPosition",
        dataType: "vec3",
        role: "out"
      }, {
        name: "fsTex0Coord",
        dataType: "vec2",
        role: "out"
      }, {
        name: "fsTex1Coord",
        dataType: "vec2",
        role: "out"
      }, {
        name: "fsNormal",
        dataType: "vec3",
        role: "out"
      }, {
        name: "fsTangent",
        dataType: "vec3",
        role: "out"
      }, {
        name: "fsBitangent",
        dataType: "vec3",
        role: "out"
      }, {
        name: "fsSurfaceToView",
        dataType: "vec3",
        role: "out"
      }, {
        name: "fsVertexPosFromLight",
        dataType: "vec4",
        role: "out"
      }]);
      if (bg.Engine.Get().id == "webgl1") {
        s_vertexSource.setMainBody("\n\t\t\t\t\tmat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0,\n\t\t\t\t\t\t\t\t\t\t\t0.0, 0.5, 0.0, 0.0,\n\t\t\t\t\t\t\t\t\t\t\t0.0, 0.0, 0.5, 0.0,\n\t\t\t\t\t\t\t\t\t\t\t0.5, 0.5, 0.5, 1.0);\n\t\t\t\t\t\n\t\t\t\t\tvec4 viewPos = inViewMatrix * inModelMatrix * vec4(inVertex,1.0);\n\t\t\t\t\tgl_Position = inProjectionMatrix * viewPos;\n\t\t\t\t\t\n\t\t\t\t\tfsNormal = normalize((inNormalMatrix * vec4(inNormal,1.0)).xyz);\n\t\t\t\t\tfsTangent = normalize((inNormalMatrix * vec4(inTangent,1.0)).xyz);\n\t\t\t\t\tfsBitangent = cross(fsNormal,fsTangent);\n\t\t\t\t\t\n\t\t\t\t\tfsVertexPosFromLight = ScaleMatrix * inLightProjectionMatrix * inLightViewMatrix * inModelMatrix * vec4(inVertex,1.0);\n\t\t\t\t\t\n\t\t\t\t\tfsTex0Coord = inTex0;\n\t\t\t\t\tfsTex1Coord = inTex1;\n\t\t\t\t\tfsPosition = viewPos.xyz;");
      }
    }
    return s_vertexSource;
  }
  function fragmentShaderSource() {
    if (!s_fragmentSource) {
      s_fragmentSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
      s_fragmentSource.addParameter(lib().inputs.material.all);
      s_fragmentSource.addParameter(lib().inputs.lightingForward.all);
      s_fragmentSource.addParameter(lib().inputs.shadows.all);
      s_fragmentSource.addParameter(lib().inputs.colorCorrection.all);
      s_fragmentSource.addParameter([{
        name: "fsPosition",
        dataType: "vec3",
        role: "in"
      }, {
        name: "fsTex0Coord",
        dataType: "vec2",
        role: "in"
      }, {
        name: "fsTex1Coord",
        dataType: "vec2",
        role: "in"
      }, {
        name: "fsNormal",
        dataType: "vec3",
        role: "in"
      }, {
        name: "fsTangent",
        dataType: "vec3",
        role: "in"
      }, {
        name: "fsBitangent",
        dataType: "vec3",
        role: "in"
      }, {
        name: "fsSurfaceToView",
        dataType: "vec3",
        role: "in"
      }, {
        name: "fsVertexPosFromLight",
        dataType: "vec4",
        role: "in"
      }, {
        name: "inCubeMap",
        dataType: "samplerCube",
        role: "value"
      }, {
        name: "inLightEmissionFactor",
        dataType: "float",
        role: "value"
      }]);
      s_fragmentSource.addFunction(lib().functions.materials.all);
      s_fragmentSource.addFunction(lib().functions.colorCorrection.all);
      s_fragmentSource.addFunction(lib().functions.utils.unpack);
      s_fragmentSource.addFunction(lib().functions.utils.random);
      s_fragmentSource.addFunction(lib().functions.lighting.all);
      s_fragmentSource.addFunction(lib().functions.blur.blurCube);
      if (bg.Engine.Get().id == "webgl1") {
        s_fragmentSource.setMainBody(("\n\t\t\t\t\tvec4 diffuseColor = samplerColor(inTexture,fsTex0Coord,inTextureOffset,inTextureScale);\n\t\t\t\t\tif (inUnlit && diffuseColor.a>=inAlphaCutoff) {\n\t\t\t\t\t\tgl_FragColor = diffuseColor;\n\t\t\t\t\t}\n\t\t\t\t\telse if (diffuseColor.a>=inAlphaCutoff) {\n\t\t\t\t\t\tvec4 lightmapColor = samplerColor(inLightMap,fsTex1Coord,inLightMapOffset,inLightMapScale);\n\t\t\t\t\t\tvec3 normalMap = samplerNormal(inNormalMap,fsTex0Coord,inNormalMapOffset,inNormalMapScale);\n\t\t\t\t\t\tnormalMap = combineNormalWithMap(fsNormal,fsTangent,fsBitangent,normalMap);\n\t\t\t\t\t\tvec4 shadowColor = vec4(1.0);\n\t\t\t\t\t\tif (inReceiveShadows) {\n\t\t\t\t\t\t\tshadowColor = getShadowColor(fsVertexPosFromLight,inShadowMap,inShadowMapSize,inShadowType,inShadowStrength,inShadowBias,inShadowColor);\n\t\t\t\t\t\t}\n\t\t\t\t\t\tvec4 specular = specularColor(inSpecularColor,inShininessMask,fsTex0Coord,inTextureOffset,inTextureScale,\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tinShininessMaskChannel,inShininessMaskInvert);\n\t\t\t\t\t\tfloat lightEmission = applyTextureMask(inLightEmission,\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tinLightEmissionMask,fsTex0Coord,inTextureOffset,inTextureScale,\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tinLightEmissionMaskChannel,inLightEmissionMaskInvert);\n\t\t\t\t\t\tdiffuseColor = diffuseColor * inDiffuseColor * lightmapColor;\n\t\t\t\t\t\t\n\t\t\t\t\t\tvec4 light = vec4(0.0,0.0,0.0,1.0);\n\t\t\t\t\t\tfor (int i=0; i<" + bg.base.MAX_FORWARD_LIGHTS + "; ++i) {\n\t\t\t\t\t\t\tif (i>=inNumLights) break;\n\t\t\t\t\t\t\tlight.rgb += getLight(\n\t\t\t\t\t\t\t\tinLightType[i],\n\t\t\t\t\t\t\t\tinLightAmbient[i], inLightDiffuse[i], inLightSpecular[i],inShininess,\n\t\t\t\t\t\t\t\tinLightPosition[i],inLightDirection[i],\n\t\t\t\t\t\t\t\tinLightAttenuation[i].x,inLightAttenuation[i].y,inLightAttenuation[i].z,\n\t\t\t\t\t\t\t\tinSpotCutoff[i],inSpotExponent[i],inLightCutoffDistance[i],\n\t\t\t\t\t\t\t\tfsPosition,normalMap,\n\t\t\t\t\t\t\t\tdiffuseColor,specular,shadowColor\n\t\t\t\t\t\t\t).rgb;\n\t\t\t\t\t\t}\n\n\t\t\t\t\t\tvec3 cameraPos = vec3(0.0);\n\t\t\t\t\t\tvec3 cameraVector = fsPosition - cameraPos;\n\t\t\t\t\t\tvec3 lookup = reflect(cameraVector,normalMap);\n\t\t\t\t\t\tfloat dist = distance(fsPosition,cameraPos);\n\t\t\t\t\t\tfloat maxRough = 50.0;\n\t\t\t\t\t\tfloat rough = max(inRoughness * 10.0,1.0);\n\t\t\t\t\t\trough = max(rough*dist,rough);\n\t\t\t\t\t\tfloat blur = min(rough,maxRough);\n\t\t\t\t\t\tvec3 cubemapColor = blurCube(inCubeMap,lookup,int(blur),vec2(10),dist).rgb;\n\n\t\t\t\t\t\tfloat reflectionAmount = applyTextureMask(inReflection,\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tinReflectionMask,fsTex0Coord,inTextureOffset,inTextureScale,\n\t\t\t\t\t\t\t\t\t\t\t\t\t\tinReflectionMaskChannel,inReflectionMaskInvert);\n\n\t\t\t\t\t\tlight.rgb = clamp(light.rgb + (lightEmission * diffuseColor.rgb * 10.0), vec3(0.0), vec3(1.0));\n\t\t\t\t\t\tvec3 finalColor = light.rgb * (1.0 - reflectionAmount);\n\t\t\t\t\t\tfinalColor += cubemapColor * reflectionAmount;\n\t\t\t\t\t\tvec4 result = colorCorrection(vec4(finalColor,1.0),inHue,inSaturation,inLightness,inBrightness,inContrast);\n\t\t\t\t\t\tresult.a = diffuseColor.a;\n\t\t\t\t\t\tgl_FragColor = result;\n\t\t\t\t\t}\n\t\t\t\t\telse {\n\t\t\t\t\t\tdiscard;\n\t\t\t\t\t}"));
      }
    }
    return s_fragmentSource;
  }
  var ColorCorrectionSettings = function() {
    function ColorCorrectionSettings() {
      this._hue = 1;
      this._saturation = 1;
      this._lightness = 1;
      this._brightness = 0.5;
      this._contrast = 0.5;
    }
    return ($traceurRuntime.createClass)(ColorCorrectionSettings, {
      set hue(h) {
        this._hue = h;
      },
      get hue() {
        return this._hue;
      },
      set saturation(s) {
        this._saturation = s;
      },
      get saturation() {
        return this._saturation;
      },
      set lightness(l) {
        this._lightness = l;
      },
      get lightness() {
        return this._lightness;
      },
      set brightness(b) {
        this._brightness = b;
      },
      get brightness() {
        return this._brightness;
      },
      set contrast(c) {
        this._contrast = c;
      },
      get contrast() {
        return this._contrast;
      },
      apply: function(shader) {
        var varNames = arguments[1] !== (void 0) ? arguments[1] : {
          hue: 'inHue',
          saturation: 'inSaturation',
          lightness: 'inLightness',
          brightness: 'inBrightness',
          contrast: 'inContrast'
        };
        shader.setValueFloat(varNames['hue'], this._hue);
        shader.setValueFloat(varNames['saturation'], this._saturation);
        shader.setValueFloat(varNames['lightness'], this._lightness);
        shader.setValueFloat(varNames['brightness'], this._brightness);
        shader.setValueFloat(varNames['contrast'], this._contrast);
      }
    }, {});
  }();
  bg.base.ColorCorrectionSettings = ColorCorrectionSettings;
  var ForwardEffect = function($__super) {
    function ForwardEffect(context) {
      $traceurRuntime.superConstructor(ForwardEffect).call(this, context);
      this._material = null;
      this._light = null;
      this._lightTransform = bg.Matrix4.Identity();
      this._lightArray = new bg.base.LightArray();
      this._shadowMap = null;
      var sources = [vertexShaderSource(), fragmentShaderSource()];
      this.setupShaderSource(sources);
      this._colorCorrection = new bg.base.ColorCorrectionSettings();
    }
    return ($traceurRuntime.createClass)(ForwardEffect, {
      get material() {
        return this._material;
      },
      set material(m) {
        this._material = m;
      },
      get light() {
        return this._light;
      },
      set light(l) {
        this._light = l;
        this._lightArray.reset();
      },
      get lightTransform() {
        return this._lightTransform;
      },
      set lightTransform(trx) {
        this._lightTransform = trx;
        this._lightArray.reset();
      },
      get lightArray() {
        return this._lightArray;
      },
      set shadowMap(sm) {
        this._shadowMap = sm;
      },
      get shadowMap() {
        return this._shadowMap;
      },
      get colorCorrection() {
        return this._colorCorrection;
      },
      set colorCorrection(cc) {
        this._colorCorrection = cc;
      },
      beginDraw: function() {
        if (this._light) {
          this.lightArray.reset();
          this.lightArray.push(this.light, this.lightTransform);
        }
        if (this.lightArray.numLights) {
          var matrixState = bg.base.MatrixState.Current();
          var viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
          this.lightArray.updatePositionAndDirection(viewMatrix);
          var lightTransform = this.shadowMap ? this.shadowMap.viewMatrix : this.lightArray.shadowLightTransform;
          this.shader.setMatrix4("inLightProjectionMatrix", this.shadowMap ? this.shadowMap.projection : this.lightArray.shadowLight.projection);
          var shadowColor = this.shadowMap ? this.shadowMap.shadowColor : bg.Color.Transparent();
          var blackTex = bg.base.TextureCache.BlackTexture(this.context);
          this.shader.setMatrix4("inLightViewMatrix", lightTransform);
          this.shader.setValueInt("inShadowType", this._shadowMap ? this._shadowMap.shadowType : 0);
          this.shader.setTexture("inShadowMap", this._shadowMap ? this._shadowMap.texture : blackTex, bg.base.TextureUnit.TEXTURE_5);
          this.shader.setVector2("inShadowMapSize", this._shadowMap ? this._shadowMap.size : new bg.Vector2(32, 32));
          this.shader.setValueFloat("inShadowStrength", this.lightArray.shadowLight.shadowStrength);
          this.shader.setVector4("inShadowColor", shadowColor);
          this.shader.setValueFloat("inShadowBias", this.lightArray.shadowLight.shadowBias);
          this.shader.setValueInt("inCastShadows", this.lightArray.shadowLight.castShadows);
          this.shader.setVector4Ptr('inLightAmbient', this.lightArray.ambient);
          this.shader.setVector4Ptr('inLightDiffuse', this.lightArray.diffuse);
          this.shader.setVector4Ptr('inLightSpecular', this.lightArray.specular);
          this.shader.setValueIntPtr('inLightType', this.lightArray.type);
          this.shader.setVector3Ptr('inLightAttenuation', this.lightArray.attenuation);
          this.shader.setValueFloatPtr('inLightCutoffDistance', this.lightArray.cutoffDistance);
          var lightEmissionFactor = 10;
          this.shader.setValueFloat('inLightEmissionFactor', lightEmissionFactor);
          this.shader.setTexture('inCubeMap', bg.scene.Cubemap.Current(this.context), bg.base.TextureUnit.TEXTURE_6);
          this.shader.setVector3Ptr('inLightDirection', this.lightArray.direction);
          this.shader.setVector3Ptr('inLightPosition', this.lightArray.position);
          this.shader.setValueFloatPtr('inSpotCutoff', this.lightArray.spotCutoff);
          this.shader.setValueFloatPtr('inSpotExponent', this.lightArray.spotExponent);
          this.shader.setValueInt('inNumLights', this.lightArray.numLights);
        } else {
          var BLACK = bg.Color.Black();
          this.shader.setVector4Ptr('inLightAmbient', BLACK.toArray());
          this.shader.setVector4Ptr('inLightDiffuse', BLACK.toArray());
          this.shader.setVector4Ptr('inLightSpecular', BLACK.toArray());
          this.shader.setVector3Ptr('inLightDirection', (new bg.Vector3(0, 0, 0)).toArray());
          this.shader.setValueInt('inNumLights', 0);
        }
        this.colorCorrection.apply(this.shader);
      },
      setupVars: function() {
        if (this.material) {
          var matrixState = bg.base.MatrixState.Current();
          var viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
          this.shader.setMatrix4('inModelMatrix', matrixState.modelMatrixStack.matrixConst);
          this.shader.setMatrix4('inViewMatrix', viewMatrix);
          this.shader.setMatrix4('inProjectionMatrix', matrixState.projectionMatrixStack.matrixConst);
          this.shader.setMatrix4('inNormalMatrix', matrixState.normalMatrix);
          this.shader.setMatrix4('inViewMatrixInv', matrixState.viewMatrixInvert);
          var whiteTex = bg.base.TextureCache.WhiteTexture(this.context);
          var blackTex = bg.base.TextureCache.BlackTexture(this.context);
          var normalTex = bg.base.TextureCache.NormalTexture(this.context);
          var texture = this.material.texture || whiteTex;
          var lightMap = this.material.lightmap || whiteTex;
          var normalMap = this.material.normalMap || normalTex;
          var shininessMask = this.material.shininessMask || blackTex;
          var lightEmissionMask = this.material.lightEmissionMask || whiteTex;
          this.shader.setVector4('inDiffuseColor', this.material.diffuse);
          this.shader.setVector4('inSpecularColor', this.material.specular);
          this.shader.setValueFloat('inShininess', this.material.shininess);
          this.shader.setTexture('inShininessMask', shininessMask, bg.base.TextureUnit.TEXTURE_3);
          this.shader.setVector4('inShininessMaskChannel', this.material.shininessMaskChannelVector);
          this.shader.setValueInt('inShininessMaskInvert', this.material.shininessMaskInvert);
          this.shader.setValueFloat('inLightEmission', this.material.lightEmission);
          this.shader.setTexture('inLightEmissionMask', lightEmissionMask, bg.base.TextureUnit.TEXTURE_4);
          this.shader.setVector4('inLightEmissionMaskChannel', this.material.lightEmissionMaskChannelVector);
          this.shader.setValueInt('inLightEmissionMaskInvert', this.material.lightEmissionMaskInvert);
          this.shader.setTexture('inTexture', texture, bg.base.TextureUnit.TEXTURE_0);
          this.shader.setVector2('inTextureOffset', this.material.textureOffset);
          this.shader.setVector2('inTextureScale', this.material.textureScale);
          this.shader.setTexture('inLightMap', lightMap, bg.base.TextureUnit.TEXTURE_1);
          this.shader.setVector2('inLightMapOffset', this.material.lightmapOffset);
          this.shader.setVector2('inLightMapScale', this.material.lightmapScale);
          this.shader.setTexture('inNormalMap', normalMap, bg.base.TextureUnit.TEXTURE_2);
          this.shader.setVector2('inNormalMapScale', this.material.normalMapScale);
          this.shader.setVector2('inNormalMapOffset', this.material.normalMapOffset);
          this.shader.setValueInt('inReceiveShadows', this.material.receiveShadows);
          var reflectionMask = this.material.reflectionMask || whiteTex;
          this.shader.setValueFloat('inReflection', this.material.reflectionAmount);
          this.shader.setTexture('inReflectionMask', reflectionMask, bg.base.TextureUnit.TEXTURE_7);
          this.shader.setVector4('inReflectionMaskChannel', this.material.reflectionMaskChannelVector);
          this.shader.setValueInt('inReflectionMaskInvert', this.material.reflectionMaskInvert);
          var roughnessMask = this.material.roughnessMask || whiteTex;
          this.shader.setValueFloat('inRoughness', this.material.roughness);
          this.shader.setTexture('inRoughnessMask', roughnessMask, bg.base.TextureUnit.TEXTURE_8);
          this.shader.setVector4('inRoughnessMaskChannel', this.material.roughnessMaskChannelVector);
          this.shader.setValueInt('inRoughnessMaskInvert', this.material.roughnessMaskInvert);
          this.shader.setValueInt('inSelectMode', false);
          this.shader.setValueInt('inUnlit', this.material.unlit);
        }
      }
    }, {}, $__super);
  }(bg.base.Effect);
  bg.base.ForwardEffect = ForwardEffect;
  bg.base.MAX_FORWARD_LIGHTS = 4;
})();

"use strict";
(function() {
  bg.base.LightType = {
    DIRECTIONAL: 4,
    SPOT: 1,
    POINT: 5,
    DISABLED: 10
  };
  var Light = function($__super) {
    function Light(context) {
      $traceurRuntime.superConstructor(Light).call(this, context);
      this._enabled = true;
      this._type = bg.base.LightType.DIRECTIONAL;
      this._direction = new bg.Vector3(0, 0, -1);
      this._ambient = new bg.Color(0.2, 0.2, 0.2, 1);
      this._diffuse = new bg.Color(0.9, 0.9, 0.9, 1);
      this._specular = bg.Color.White();
      this._attenuation = new bg.Vector3(1, 0.5, 0.1);
      this._spotCutoff = 20;
      this._spotExponent = 30;
      this._shadowStrength = 0.7;
      this._cutoffDistance = -1;
      this._castShadows = true;
      this._shadowBias = 0.00002;
      this._projection = bg.Matrix4.Ortho(-10, 10, -10, 10, 0.5, 300.0);
    }
    return ($traceurRuntime.createClass)(Light, {
      clone: function(context) {
        var newLight = new bg.base.Light(context || this.context);
        newLight.assign(this);
        return newLight;
      },
      assign: function(other) {
        this.enabled = other.enabled;
        this.type = other.type;
        this.direction.assign(other.direction);
        this.ambient.assign(other.ambient);
        this.diffuse.assign(other.diffuse);
        this.specular.assign(other.specular);
        this.attenuation.assign(other.attenuation);
        this.spotCutoff = other.spotCutoff;
        this.spotExponent = other.spotExponent;
        this.shadowStrength = other.shadowStrength;
        this.cutoffDistance = other.cutoffDistance;
        this.castShadows = other.castShadows;
        this.shadowBias = other.shadowBias;
      },
      get enabled() {
        return this._enabled;
      },
      set enabled(v) {
        this._enabled = v;
      },
      get type() {
        return this._type;
      },
      set type(t) {
        this._type = t;
      },
      get direction() {
        return this._direction;
      },
      set direction(d) {
        this._direction = d;
      },
      get ambient() {
        return this._ambient;
      },
      set ambient(a) {
        this._ambient = a;
      },
      get diffuse() {
        return this._diffuse;
      },
      set diffuse(d) {
        this._diffuse = d;
      },
      get specular() {
        return this._specular;
      },
      set specular(s) {
        this._specular = s;
      },
      get attenuationVector() {
        return this._attenuation;
      },
      get constantAttenuation() {
        return this._attenuation.x;
      },
      get linearAttenuation() {
        return this._attenuation.y;
      },
      get quadraticAttenuation() {
        return this._attenuation.z;
      },
      set attenuationVector(a) {
        this._attenuation = a;
      },
      set constantAttenuation(a) {
        this._attenuation.x = a;
      },
      set linearAttenuation(a) {
        this._attenuation.y = a;
      },
      set quadraticAttenuation(a) {
        this._attenuation.z = a;
      },
      get cutoffDistance() {
        return this._cutoffDistance;
      },
      set cutoffDistance(c) {
        this._cutoffDistance = c;
      },
      get spotCutoff() {
        return this._spotCutoff;
      },
      set spotCutoff(c) {
        this._spotCutoff = c;
      },
      get spotExponent() {
        return this._spotExponent;
      },
      set spotExponent(e) {
        this._spotExponent = e;
      },
      get shadowStrength() {
        return this._shadowStrength;
      },
      set shadowStrength(s) {
        this._shadowStrength = s;
      },
      get castShadows() {
        return this._castShadows;
      },
      set castShadows(s) {
        this._castShadows = s;
      },
      get shadowBias() {
        return this._shadowBias;
      },
      set shadowBias(s) {
        this._shadowBias = s;
      },
      get projection() {
        return this._projection;
      },
      set projection(p) {
        this._projection = p;
      },
      deserialize: function(sceneData) {
        switch (sceneData.lightType) {
          case 'kTypeDirectional':
            this._type = bg.base.LightType.DIRECTIONAL;
            break;
          case 'kTypeSpot':
            this._type = bg.base.LightType.SPOT;
            this._shadowBias = sceneData.shadowBias;
            break;
          case 'kTypePoint':
            this._type = bg.base.LightType.POINT;
            break;
        }
        this._ambient = new bg.Color(sceneData.ambient);
        this._diffuse = new bg.Color(sceneData.diffuse);
        this._specular = new bg.Color(sceneData.specular);
        this._attenuation = new bg.Vector3(sceneData.constantAtt, sceneData.linearAtt, sceneData.expAtt);
        this._spotCutoff = sceneData.spotCutoff || 20;
        this._spotExponent = sceneData.spotExponent || 30;
        this._shadowStrength = sceneData.shadowStrength;
        this._cutoffDistance = sceneData.cutoffDistance;
        this._projection = new bg.Matrix4(sceneData.projection);
        this._castShadows = sceneData.castShadows;
      },
      serialize: function(sceneData) {
        var lightTypes = [];
        lightTypes[bg.base.LightType.DIRECTIONAL] = "kTypeDirectional";
        lightTypes[bg.base.LightType.SPOT] = "kTypeSpot";
        lightTypes[bg.base.LightType.POINT] = "kTypePoint";
        sceneData.lightType = lightTypes[this._type];
        sceneData.ambient = this._ambient.toArray();
        sceneData.diffuse = this._diffuse.toArray();
        sceneData.specular = this._specular.toArray();
        sceneData.intensity = 1;
        sceneData.constantAtt = this._attenuation.x;
        sceneData.linearAtt = this._attenuation.y;
        sceneData.expAtt = this._attenuation.z;
        sceneData.spotCutoff = this._spotCutoff || 20;
        sceneData.spotExponent = this._spotExponent || 30;
        sceneData.shadowStrength = this._shadowStrength;
        sceneData.cutoffDistance = this._cutoffDistance;
        sceneData.projection = this._projection.toArray();
        sceneData.castShadows = this._castShadows;
        sceneData.shadowBias = this._shadowBias || 0.0029;
      }
    }, {}, $__super);
  }(bg.app.ContextObject);
  bg.base.Light = Light;
  var LightArray = function() {
    function LightArray() {
      this.reset();
    }
    return ($traceurRuntime.createClass)(LightArray, {
      get type() {
        return this._type;
      },
      get ambient() {
        return this._ambient;
      },
      get diffuse() {
        return this._diffuse;
      },
      get specular() {
        return this._specular;
      },
      get position() {
        return this._position;
      },
      get direction() {
        return this._direction;
      },
      get rawDirection() {
        return this._rawDirection;
      },
      get attenuation() {
        return this._attenuation;
      },
      get spotCutoff() {
        return this._spotCutoff;
      },
      get spotExponent() {
        return this._spotExponent;
      },
      get shadowStrength() {
        return this._shadowStrength;
      },
      get cutoffDistance() {
        return this._cutoffDistance;
      },
      get numLights() {
        return this._numLights;
      },
      get lightTransform() {
        return this._lightTransform;
      },
      get shadowLight() {
        return this._shadowLight || {
          shadowStrength: 0,
          shadowColor: bg.Color.Black(),
          shadowBias: 0,
          castShadows: false,
          projection: bg.Matrix4.Identity()
        };
      },
      get shadowLightTransform() {
        return this._shadowLightTransform || bg.Matrix4.Identity();
      },
      get shadowLightIndex() {
        return this._shadowLightIndex;
      },
      reset: function() {
        this._type = [];
        this._ambient = [];
        this._diffuse = [];
        this._specular = [];
        this._position = [];
        this._direction = [];
        this._rawDirection = [];
        this._attenuation = [];
        this._spotCutoff = [];
        this._spotExponent = [];
        this._shadowStrength = [];
        this._cutoffDistance = [];
        this._numLights = 0;
        this._lightTransform = [];
        this._shadowLightTransform = null;
        this._shadowLightIndex = -1;
        this._shadowLight = null;
      },
      push: function(light, lightTransform) {
        var $__3,
            $__4,
            $__5;
        if (this._numLights == bg.base.MAX_FORWARD_LIGHTS) {
          return false;
        } else {
          if (this._shadowLightIndex == -1 && light.type != bg.base.LightType.POINT && light.castShadows) {
            this._shadowLightTransform = lightTransform;
            this._shadowLight = light;
            this._shadowLightIndex = this._numLights;
          }
          this._type.push(light.type);
          ($__3 = this._ambient).push.apply($__3, $traceurRuntime.spread((light.ambient.toArray())));
          ($__4 = this._diffuse).push.apply($__4, $traceurRuntime.spread((light.diffuse.toArray())));
          ($__5 = this._specular).push.apply($__5, $traceurRuntime.spread((light.specular.toArray())));
          this._rawDirection.push(light.direction);
          this._attenuation.push(light.constantAttenuation);
          this._attenuation.push(light.linearAttenuation);
          this._attenuation.push(light.quadraticAttenuation);
          this._spotCutoff.push(light.spotCutoff);
          this._spotExponent.push(light.spotExponent);
          this._shadowStrength.push(light.shadowStrength);
          this._cutoffDistance.push(light.cutoffDistance);
          this._numLights++;
          this._lightTransform.push(lightTransform);
          return true;
        }
      },
      updatePositionAndDirection: function(viewMatrix) {
        var $__3,
            $__4;
        this._direction = [];
        this._position = [];
        for (var i = 0; i < this._numLights; ++i) {
          var vm = new bg.Matrix4(viewMatrix);
          var dir = vm.mult(this._lightTransform[i]).rotation.multVector(this._rawDirection[i]).xyz;
          vm = new bg.Matrix4(viewMatrix);
          var pos = vm.mult(this._lightTransform[i]).position;
          ($__3 = this._direction).push.apply($__3, $traceurRuntime.spread((dir.toArray())));
          ($__4 = this._position).push.apply($__4, $traceurRuntime.spread((pos.toArray())));
        }
      }
    }, {});
  }();
  bg.base.LightArray = LightArray;
})();

"use strict";
(function() {
  bg.base.MaterialFlag = {
    DIFFUSE: 1 << 0,
    SPECULAR: 1 << 1,
    SHININESS: 1 << 2,
    LIGHT_EMISSION: 1 << 3,
    REFRACTION_AMOUNT: 1 << 4,
    REFLECTION_AMOUNT: 1 << 5,
    TEXTURE: 1 << 6,
    LIGHT_MAP: 1 << 7,
    NORMAL_MAP: 1 << 8,
    TEXTURE_OFFSET: 1 << 9,
    TEXTURE_SCALE: 1 << 10,
    LIGHT_MAP_OFFSET: 1 << 11,
    LIGHT_MAP_SCALE: 1 << 12,
    NORMAL_MAP_OFFSET: 1 << 13,
    NORMAL_MAP_SCALE: 1 << 14,
    CAST_SHADOWS: 1 << 15,
    RECEIVE_SHADOWS: 1 << 16,
    ALPHA_CUTOFF: 1 << 17,
    SHININESS_MASK: 1 << 18,
    SHININESS_MASK_CHANNEL: 1 << 19,
    SHININESS_MASK_INVERT: 1 << 20,
    LIGHT_EMISSION_MASK: 1 << 21,
    LIGHT_EMISSION_MASK_CHANNEL: 1 << 22,
    LIGHT_EMISSION_MASK_INVERT: 1 << 23,
    REFLECTION_MASK: 1 << 24,
    REFLECTION_MASK_CHANNEL: 1 << 25,
    REFLECTION_MASK_INVERT: 1 << 26,
    CULL_FACE: 1 << 27,
    ROUGHNESS: 1 << 28,
    UNLIT: 1 << 29
  };
  function loadTexture(context, image, url) {
    var texture = null;
    if (image) {
      texture = bg.base.TextureCache.Get(context).find(url);
      if (!texture) {
        bg.log(("Texture " + url + " not found. Loading texture"));
        texture = new bg.base.Texture(context);
        texture.create();
        texture.bind();
        texture.minFilter = bg.base.TextureLoaderPlugin.GetMinFilter();
        texture.magFilter = bg.base.TextureLoaderPlugin.GetMagFilter();
        texture.setImage(image);
        texture.fileName = url;
        bg.base.TextureCache.Get(context).register(url, texture);
      }
    }
    return texture;
  }
  var MaterialModifier = function() {
    function MaterialModifier(jsonData) {
      this._modifierFlags = 0;
      this._diffuse = bg.Color.White();
      this._specular = bg.Color.White();
      this._shininess = 0;
      this._lightEmission = 0;
      this._refractionAmount = 0;
      this._reflectionAmount = 0;
      this._texture = null;
      this._lightmap = null;
      this._normalMap = null;
      this._textureOffset = new bg.Vector2();
      this._textureScale = new bg.Vector2(1);
      this._lightmapOffset = new bg.Vector2();
      this._lightmapScale = new bg.Vector2(1);
      this._normalMapOffset = new bg.Vector2();
      this._normalMapScale = new bg.Vector2(1);
      this._castShadows = true;
      this._receiveShadows = true;
      this._alphaCutoff = 0.5;
      this._shininessMask = null;
      this._shininessMaskChannel = 0;
      this._shininessMaskInvert = false;
      this._lightEmissionMask = null;
      this._lightEmissionMaskChannel = 0;
      this._lightEmissionMaskInvert = false;
      this._reflectionMask = null;
      this._reflectionMaskChannel = 0;
      this._reflectionMaskInvert = false;
      this._cullFace = true;
      this._roughness = true;
      this._roughnessMask = null;
      this._roughnessMaskChannel = 0;
      this._roughnessMaskInvert = false;
      this._unlit = false;
      if (jsonData) {
        if (jsonData.diffuseR !== undefined && jsonData.diffuseG !== undefined && jsonData.diffuseB !== undefined) {
          this.diffuse = new bg.Color(jsonData.diffuseR, jsonData.diffuseG, jsonData.diffuseB, jsonData.diffuseA ? jsonData.diffuseA : 1.0);
        }
        if (jsonData.specularR !== undefined && jsonData.specularG !== undefined && jsonData.specularB !== undefined) {
          this.specular = new bg.Color(jsonData.specularR, jsonData.specularG, jsonData.specularB, jsonData.specularA ? jsonData.specularA : 1.0);
        }
        if (jsonData.shininess !== undefined) {
          this.shininess = jsonData.shininess;
        }
        if (jsonData.lightEmission !== undefined) {
          this.lightEmission = jsonData.lightEmission;
        }
        if (jsonData.refractionAmount !== undefined) {
          this.refractionAmount = jsonData.refractionAmount;
        }
        if (jsonData.reflectionAmount !== undefined) {
          this.reflectionAmount = jsonData.reflectionAmount;
        }
        if (jsonData.texture !== undefined) {
          this.texture = jsonData.texture;
        }
        if (jsonData.lightmap !== undefined) {
          this.lightmap = jsonData.lightmap;
        }
        if (jsonData.normalMap !== undefined) {
          this.normalMap = jsonData.normalMap;
        }
        if (jsonData.textureOffsetX !== undefined && jsonData.textureOffsetY !== undefined) {
          this.textureOffset = new bg.Vector2(jsonData.textureOffsetX, jsonData.textureOffsetY);
        }
        if (jsonData.textureScaleX !== undefined && jsonData.textureScaleY !== undefined) {
          this.textureScale = new bg.Vector2(jsonData.textureScaleX, jsonData.textureScaleY);
        }
        if (jsonData.lightmapOffsetX !== undefined && jsonData.lightmapOffsetY !== undefined) {
          this.lightmapOffset = new bg.Vector2(jsonData.lightmapOffsetX, jsonData.lightmapOffsetY);
        }
        if (jsonData.lightmapScaleX !== undefined && jsonData.lightmapScaleY !== undefined) {
          this.lightmapScale = new bg.Vector2(jsonData.lightmapScaleX, jsonData.lightmapScaleY);
        }
        if (jsonData.normalMapScaleX !== undefined && jsonData.normalMapScaleY !== undefined) {
          this.normalMapScale = new bg.Vector2(jsonData.normalMapScaleX, jsonData.normalMapScaleY);
        }
        if (jsonData.normalMapOffsetX !== undefined && jsonData.normalMapOffsetY !== undefined) {
          this.normalMapOffset = new bg.Vector2(jsonData.normalMapOffsetX, jsonData.normalMapOffsetY);
        }
        if (jsonData.castShadows !== undefined) {
          this.castShadows = jsonData.castShadows;
        }
        if (jsonData.receiveShadows !== undefined) {
          this.receiveShadows = jsonData.receiveShadows;
        }
        if (jsonData.alphaCutoff !== undefined) {
          this.alphaCutoff = jsonData.alphaCutoff;
        }
        if (jsonData.shininessMask !== undefined) {
          this.shininessMask = jsonData.shininessMask;
        }
        if (jsonData.shininessMaskChannel !== undefined) {
          this.shininessMaskChannel = jsonData.shininessMaskChannel;
        }
        if (jsonData.invertShininessMask !== undefined) {
          this.shininessMaskInvert = jsonData.invertShininessMask;
        }
        if (jsonData.lightEmissionMask !== undefined) {
          this.lightEmissionMask = jsonData.lightEmissionMask;
        }
        if (jsonData.lightEmissionMaskChannel !== undefined) {
          this.lightEmissionMaskChannel = jsonData.lightEmissionMaskChannel;
        }
        if (jsonData.invertLightEmissionMask !== undefined) {
          this.lightEmissionMaskInvert = jsonData.invertLightEmissionMask;
        }
        if (jsonData.reflectionMask !== undefined) {
          this.reflectionMask = jsonData.reflectionMask;
        }
        if (jsonData.reflectionMaskChannel !== undefined) {
          this.reflectionMaskChannel = jsonData.reflectionMaskChannel;
        }
        if (jsonData.invertReflectionMask !== undefined) {
          this.reflectionMaskInvert = jsonData.reflectionMaskInvert;
        }
        if (jsonData.roughness !== undefined) {
          this.roughness = jsonData.roughness;
        }
        if (jsonData.roughnessMask !== undefined) {
          this.roughnessMask = jsonData.roughnessMask;
        }
        if (jsonData.roughnessMaskChannel !== undefined) {
          this.roughnessMaskChannel = jsonData.roughnessMaskChannel;
        }
        if (jsonData.invertRoughnessMask !== undefined) {
          this.roughnessMaskInvert = jsonData.roughnessMaskInvert;
        }
        if (jsonData.unlit !== undefined) {
          this.unlit = jsonData.unlit;
        }
      }
    }
    return ($traceurRuntime.createClass)(MaterialModifier, {
      get modifierFlags() {
        return this._modifierFlags;
      },
      set modifierFlags(f) {
        this._modifierFlags = f;
      },
      setEnabled: function(flag) {
        this._modifierFlags = this._modifierFlags | flag;
      },
      isEnabled: function(flag) {
        return (this._modifierFlags & flag) != 0;
      },
      get diffuse() {
        return this._diffuse;
      },
      get specular() {
        return this._specular;
      },
      get shininess() {
        return this._shininess;
      },
      get lightEmission() {
        return this._lightEmission;
      },
      get refractionAmount() {
        return this._refractionAmount;
      },
      get reflectionAmount() {
        return this._reflectionAmount;
      },
      get texture() {
        return this._texture;
      },
      get lightmap() {
        return this._lightmap;
      },
      get normalMap() {
        return this._normalMap;
      },
      get textureOffset() {
        return this._textureOffset;
      },
      get textureScale() {
        return this._textureScale;
      },
      get lightmapOffset() {
        return this._lightmapOffset;
      },
      get lightmapScale() {
        return this._lightmapScale;
      },
      get normalMapOffset() {
        return this._normalMapOffset;
      },
      get normalMapScale() {
        return this._normalMapScale;
      },
      get castShadows() {
        return this._castShadows;
      },
      get receiveShadows() {
        return this._receiveShadows;
      },
      get alphaCutoff() {
        return this._alphaCutoff;
      },
      get shininessMask() {
        return this._shininessMask;
      },
      get shininessMaskChannel() {
        return this._shininessMaskChannel;
      },
      get shininessMaskInvert() {
        return this._shininessMaskInvert;
      },
      get lightEmissionMask() {
        return this._lightEmissionMask;
      },
      get lightEmissionMaskChannel() {
        return this._lightEmissionMaskChannel;
      },
      get lightEmissionMaskInvert() {
        return this._lightEmissionMaskInvert;
      },
      get reflectionMask() {
        return this._reflectionMask;
      },
      get reflectionMaskChannel() {
        return this._reflectionMaskChannel;
      },
      get reflectionMaskInvert() {
        return this._reflectionMaskInvert;
      },
      get cullFace() {
        return this._cullFace;
      },
      get roughness() {
        return this._roughness;
      },
      get roughnessMask() {
        return this._roughnessMask;
      },
      get roughnessMaskChannel() {
        return this._roughnessMaskChannel;
      },
      get roughnessMaskInvert() {
        return this._roughnessMaskInvert;
      },
      get unlit() {
        return this._unlit;
      },
      set diffuse(newVal) {
        this._diffuse = newVal;
        this.setEnabled(bg.base.MaterialFlag.DIFFUSE);
      },
      set specular(newVal) {
        this._specular = newVal;
        this.setEnabled(bg.base.MaterialFlag.SPECULAR);
      },
      set shininess(newVal) {
        if (!isNaN(newVal)) {
          this._shininess = newVal;
          this.setEnabled(bg.base.MaterialFlag.SHININESS);
        }
      },
      set lightEmission(newVal) {
        if (!isNaN(newVal)) {
          this._lightEmission = newVal;
          this.setEnabled(bg.base.MaterialFlag.LIGHT_EMISSION);
        }
      },
      set refractionAmount(newVal) {
        if (!isNaN(newVal)) {
          this._refractionAmount = newVal;
          this.setEnabled(bg.base.MaterialFlag.REFRACTION_AMOUNT);
        }
      },
      set reflectionAmount(newVal) {
        if (!isNaN(newVal)) {
          this._reflectionAmount = newVal;
          this.setEnabled(bg.base.MaterialFlag.REFLECTION_AMOUNT);
        }
      },
      set texture(newVal) {
        this._texture = newVal;
        this.setEnabled(bg.base.MaterialFlag.TEXTURE);
      },
      set lightmap(newVal) {
        this._lightmap = newVal;
        this.setEnabled(bg.base.MaterialFlag.LIGHT_MAP);
      },
      set normalMap(newVal) {
        this._normalMap = newVal;
        this.setEnabled(bg.base.MaterialFlag.NORMAL_MAP);
      },
      set textureOffset(newVal) {
        this._textureOffset = newVal;
        this.setEnabled(bg.base.MaterialFlag.TEXTURE_OFFSET);
      },
      set textureScale(newVal) {
        this._textureScale = newVal;
        this.setEnabled(bg.base.MaterialFlag.TEXTURE_SCALE);
      },
      set lightmapOffset(newVal) {
        this._lightmapOffset = newVal;
        this.setEnabled(bg.base.MaterialFlag.LIGHT_MAP_OFFSET);
      },
      set lightmapScale(newVal) {
        this._lightmapScale = newVal;
        this.setEnabled(bg.base.MaterialFlag.LIGHT_MAP_SCALE);
      },
      set normalMapOffset(newVal) {
        this._normalMapOffset = newVal;
        this.setEnabled(bg.base.MaterialFlag.NORMAL_MAP_OFFSET);
      },
      set normalMapScale(newVal) {
        this._normalMapScale = newVal;
        this.setEnabled(bg.base.MaterialFlag.NORMAL_MAP_SCALE);
      },
      set castShadows(newVal) {
        this._castShadows = newVal;
        this.setEnabled(bg.base.MaterialFlag.CAST_SHADOWS);
      },
      set receiveShadows(newVal) {
        this._receiveShadows = newVal;
        this.setEnabled(bg.base.MaterialFlag.RECEIVE_SHADOWS);
      },
      set alphaCutoff(newVal) {
        if (!isNaN(newVal)) {
          this._alphaCutoff = newVal;
          this.setEnabled(bg.base.MaterialFlag.ALPHA_CUTOFF);
        }
      },
      set shininessMask(newVal) {
        this._shininessMask = newVal;
        this.setEnabled(bg.base.MaterialFlag.SHININESS_MASK);
      },
      set shininessMaskChannel(newVal) {
        this._shininessMaskChannel = newVal;
        this.setEnabled(bg.base.MaterialFlag.SHININESS_MASK_CHANNEL);
      },
      set shininessMaskInvert(newVal) {
        this._shininessMaskInvert = newVal;
        this.setEnabled(bg.base.MaterialFlag.SHININESS_MASK_INVERT);
      },
      set lightEmissionMask(newVal) {
        this._lightEmissionMask = newVal;
        this.setEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK);
      },
      set lightEmissionMaskChannel(newVal) {
        this._lightEmissionMaskChannel = newVal;
        this.setEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK_CHANNEL);
      },
      set lightEmissionMaskInvert(newVal) {
        this._lightEmissionMaskInvert = newVal;
        this.setEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK_INVERT);
      },
      set reflectionMask(newVal) {
        this._reflectionMask = newVal;
        this.setEnabled(bg.base.MaterialFlag.REFLECTION_MASK);
      },
      set reflectionMaskChannel(newVal) {
        this._reflectionMaskChannel = newVal;
        this.setEnabled(bg.base.MaterialFlag.REFLECTION_MASK_CHANNEL);
      },
      set reflectionMaskInvert(newVal) {
        this._reflectionMaskInvert = newVal;
        this.setEnabled(bg.base.MaterialFlag.REFLECTION_MASK_INVERT);
      },
      set cullFace(newVal) {
        this._cullFace = newVal;
        this.setEnabled(bg.base.MaterialFlag.CULL_FACE);
      },
      set roughness(newVal) {
        this._roughness = newVal;
        this.setEnabled(bg.base.MaterialFlag.ROUGHNESS);
      },
      set roughnessMask(newVal) {
        this._roughnessMask = newVal;
        this.setEnabled(bg.base.MaterialFlag.ROUGHNESS);
      },
      set roughnessMaskChannel(newVal) {
        this._roughnessMaskChannel = newVal;
        this.setEnabled(bg.base.MaterialFlag.ROUGHNESS);
      },
      set roughnessMaskInvert(newVal) {
        this._roughnessMaskInvert = newVal;
        this.setEnabled(bg.base.MaterialFlag.ROUGHNESS);
      },
      set unlit(newVal) {
        this._unlit = newVal;
        this.setEnabled(bg.base.MaterialFlag.UNLIT);
      },
      clone: function() {
        var copy = new MaterialModifier();
        copy.assign(this);
        return copy;
      },
      assign: function(mod) {
        this._modifierFlags = mod._modifierFlags;
        this._diffuse = mod._diffuse;
        this._specular = mod._specular;
        this._shininess = mod._shininess;
        this._lightEmission = mod._lightEmission;
        this._refractionAmount = mod._refractionAmount;
        this._reflectionAmount = mod._reflectionAmount;
        this._texture = mod._texture;
        this._lightmap = mod._lightmap;
        this._normalMap = mod._normalMap;
        this._textureOffset = mod._textureOffset;
        this._textureScale = mod._textureScale;
        this._lightmapOffset = mod._lightmapOffset;
        this._lightmapScale = mod._lightmapScale;
        this._normalMapOffset = mod._normalMapOffset;
        this._normalMapScale = mod._normalMapScale;
        this._castShadows = mod._castShadows;
        this._receiveShadows = mod._receiveShadows;
        this._alphaCutoff = mod._alphaCutoff;
        this._shininessMask = mod._shininessMask;
        this._shininessMaskChannel = mod._shininessMaskChannel;
        this._shininessMaskInvert = mod._shininessMaskInvert;
        this._lightEmissionMask = mod._lightEmissionMask;
        this._lightEmissionMaskChannel = mod._lightEmissionMaskChannel;
        this._lightEmissionMaskInvert = mod._lightEmissionMaskInvert;
        this._reflectionMask = mod._reflectionMask;
        this._reflectionMaskChannel = mod._reflectionMaskChannel;
        this._reflectionMaskInvert = mod._reflectionMaskInvert;
        this._cullFace = mod._cullFace;
        this._roughness = mod._roughness;
        this._roughnessMask = mod._roughnessMask;
        this._roughnessMaskChannel = mod._roughnessMaskChannel;
        this._roughnessMaskInvert = mod._roughnessMaskInvert;
        this._unlit = mod._unlit;
      }
    }, {});
  }();
  bg.base.MaterialModifier = MaterialModifier;
  function isAbsolutePath(path) {
    return /^(f|ht)tps?:\/\//i.test(path);
  }
  function getTexture(context, texturePath, resourcePath) {
    var texture = null;
    if (texturePath) {
      if (!isAbsolutePath(texturePath)) {
        if (resourcePath.slice(-1) != '/') {
          resourcePath += '/';
        }
        texturePath = ("" + resourcePath + texturePath);
      }
      texture = bg.base.TextureCache.Get(context).find(texturePath);
      if (!texture) {
        texture = new bg.base.Texture(context);
        texture.create();
        texture.fileName = texturePath;
        bg.base.TextureCache.Get(context).register(texturePath, texture);
        (function(path, tex) {
          bg.utils.Resource.Load(path).then(function(imgData) {
            tex.bind();
            texture.minFilter = bg.base.TextureLoaderPlugin.GetMinFilter();
            texture.magFilter = bg.base.TextureLoaderPlugin.GetMinFilter();
            tex.fileName = path;
            tex.setImage(imgData);
          });
        })(texturePath, texture);
      }
    }
    return texture;
  }
  function getPath(texture) {
    return texture ? texture.fileName : "";
  }
  function channelVector(channel) {
    return new bg.Vector4(channel == 0 ? 1 : 0, channel == 1 ? 1 : 0, channel == 2 ? 1 : 0, channel == 3 ? 1 : 0);
  }
  function readVector(data) {
    if (!data)
      return null;
    switch (data.length) {
      case 2:
        return new bg.Vector2(data[0], data[1]);
      case 3:
        return new bg.Vector3(data[0], data[1], data[2]);
      case 4:
        return new bg.Vector4(data[0], data[1], data[2], data[3]);
    }
    return null;
  }
  var g_base64Images = {};
  function readTexture(context, basePath, texData, mat, property) {
    return new Promise(function(resolve) {
      if (!texData) {
        resolve();
      } else if (/data\:image\/[a-z]+\;base64\,/.test(texData)) {
        var hash = bg.utils.md5(texData);
        if (g_base64Images[hash]) {
          mat[property] = g_base64Images[hash];
        } else {
          mat[property] = bg.base.Texture.FromBase64Image(context, texData);
          g_base64Images[hash] = mat[property];
        }
        resolve(mat[property]);
      } else {
        var fullPath = basePath + texData;
        bg.base.Loader.Load(context, fullPath).then(function(tex) {
          mat[property] = tex;
          resolve(tex);
        });
      }
    });
  }
  var Material = function() {
    function Material() {
      this._diffuse = bg.Color.White();
      this._specular = bg.Color.White();
      this._shininess = 0;
      this._lightEmission = 0;
      this._refractionAmount = 0;
      this._reflectionAmount = 0;
      this._texture = null;
      this._lightmap = null;
      this._normalMap = null;
      this._textureOffset = new bg.Vector2();
      this._textureScale = new bg.Vector2(1);
      this._lightmapOffset = new bg.Vector2();
      this._lightmapScale = new bg.Vector2(1);
      this._normalMapOffset = new bg.Vector2();
      this._normalMapScale = new bg.Vector2(1);
      this._castShadows = true;
      this._receiveShadows = true;
      this._alphaCutoff = 0.5;
      this._shininessMask = null;
      this._shininessMaskChannel = 0;
      this._shininessMaskInvert = false;
      this._lightEmissionMask = null;
      this._lightEmissionMaskChannel = 0;
      this._lightEmissionMaskInvert = false;
      this._reflectionMask = null;
      this._reflectionMaskChannel = 0;
      this._reflectionMaskInvert = false;
      this._cullFace = true;
      this._roughness = 0;
      this._roughnessMask = null;
      this._roughnessMaskChannel = 0;
      this._roughnessMaskInvert = false;
      this._unlit = false;
      this._selectMode = false;
    }
    return ($traceurRuntime.createClass)(Material, {
      clone: function() {
        var copy = new Material();
        copy.assign(this);
        return copy;
      },
      assign: function(other) {
        this._diffuse = new bg.Color(other.diffuse);
        this._specular = new bg.Color(other.specular);
        this._shininess = other.shininess;
        this._lightEmission = other.lightEmission;
        this._refractionAmount = other.refractionAmount;
        this._reflectionAmount = other.reflectionAmount;
        this._texture = other.texture;
        this._lightmap = other.lightmap;
        this._normalMap = other.normalMap;
        this._textureOffset = new bg.Vector2(other.textureOffset);
        this._textureScale = new bg.Vector2(other.textureScale);
        this._lightmapOffset = new bg.Vector2(other.ligthmapOffset);
        this._lightmapScale = new bg.Vector2(other.lightmapScale);
        this._normalMapOffset = new bg.Vector2(other.normalMapOffset);
        this._normalMapScale = new bg.Vector2(other.normalMapScale);
        this._castShadows = other.castShadows;
        this._receiveShadows = other.receiveShadows;
        this._alphaCutoff = other.alphaCutoff;
        this._shininessMask = other.shininessMask;
        this._shininessMaskChannel = other.shininessMaskChannel;
        this._shininessMaskInvert = other.shininessMaskInvert;
        this._lightEmissionMask = other.lightEmissionMask;
        this._lightEmissionMaskChannel = other.lightEmissionMaskChannel;
        this._lightEmissionMaskInvert = other.lightEmissionMaskInvert;
        this._reflectionMask = other.reflectionMask;
        this._reflectionMaskChannel = other.reflectionMaskChannel;
        this._reflectionMaskInvert = other.reflectionMaskInvert;
        this._cullFace = other.cullFace;
        this._roughness = other.roughness;
        this._roughnessMask = other.roughnessMask;
        this._roughnessMaskChannel = other.roughnessMaskChannel;
        this._roughnessMaskInvert = other.roughnessMaskInvert;
        this._unlit = other.unlit;
      },
      get isTransparent() {
        return this._diffuse.a < 1;
      },
      get diffuse() {
        return this._diffuse;
      },
      get specular() {
        return this._specular;
      },
      get shininess() {
        return this._shininess;
      },
      get lightEmission() {
        return this._lightEmission;
      },
      get refractionAmount() {
        return this._refractionAmount;
      },
      get reflectionAmount() {
        return this._reflectionAmount;
      },
      get texture() {
        return this._texture;
      },
      get lightmap() {
        return this._lightmap;
      },
      get normalMap() {
        return this._normalMap;
      },
      get textureOffset() {
        return this._textureOffset;
      },
      get textureScale() {
        return this._textureScale;
      },
      get lightmapOffset() {
        return this._lightmapOffset;
      },
      get lightmapScale() {
        return this._lightmapScale;
      },
      get normalMapOffset() {
        return this._normalMapOffset;
      },
      get normalMapScale() {
        return this._normalMapScale;
      },
      get castShadows() {
        return this._castShadows;
      },
      get receiveShadows() {
        return this._receiveShadows;
      },
      get alphaCutoff() {
        return this._alphaCutoff;
      },
      get shininessMask() {
        return this._shininessMask;
      },
      get shininessMaskChannel() {
        return this._shininessMaskChannel;
      },
      get shininessMaskInvert() {
        return this._shininessMaskInvert;
      },
      get lightEmissionMask() {
        return this._lightEmissionMask;
      },
      get lightEmissionMaskChannel() {
        return this._lightEmissionMaskChannel;
      },
      get lightEmissionMaskInvert() {
        return this._lightEmissionMaskInvert;
      },
      get reflectionMask() {
        return this._reflectionMask;
      },
      get reflectionMaskChannel() {
        return this._reflectionMaskChannel;
      },
      get reflectionMaskInvert() {
        return this._reflectionMaskInvert;
      },
      get cullFace() {
        return this._cullFace;
      },
      get roughness() {
        return this._roughness;
      },
      get roughnessMask() {
        return this._roughnessMask;
      },
      get roughnessMaskChannel() {
        return this._roughnessMaskChannel;
      },
      get roughnessMaskInvert() {
        return this._roughnessMaskInvert;
      },
      get unlit() {
        return this._unlit;
      },
      set diffuse(newVal) {
        this._diffuse = newVal;
      },
      set specular(newVal) {
        this._specular = newVal;
      },
      set shininess(newVal) {
        if (!isNaN(newVal))
          this._shininess = newVal;
      },
      set lightEmission(newVal) {
        if (!isNaN(newVal))
          this._lightEmission = newVal;
      },
      set refractionAmount(newVal) {
        this._refractionAmount = newVal;
      },
      set reflectionAmount(newVal) {
        this._reflectionAmount = newVal;
      },
      set texture(newVal) {
        this._texture = newVal;
      },
      set lightmap(newVal) {
        this._lightmap = newVal;
      },
      set normalMap(newVal) {
        this._normalMap = newVal;
      },
      set textureOffset(newVal) {
        this._textureOffset = newVal;
      },
      set textureScale(newVal) {
        this._textureScale = newVal;
      },
      set lightmapOffset(newVal) {
        this._lightmapOffset = newVal;
      },
      set lightmapScale(newVal) {
        this._lightmapScale = newVal;
      },
      set normalMapOffset(newVal) {
        this._normalMapOffset = newVal;
      },
      set normalMapScale(newVal) {
        this._normalMapScale = newVal;
      },
      set castShadows(newVal) {
        this._castShadows = newVal;
      },
      set receiveShadows(newVal) {
        this._receiveShadows = newVal;
      },
      set alphaCutoff(newVal) {
        if (!isNaN(newVal))
          this._alphaCutoff = newVal;
      },
      set shininessMask(newVal) {
        this._shininessMask = newVal;
      },
      set shininessMaskChannel(newVal) {
        this._shininessMaskChannel = newVal;
      },
      set shininessMaskInvert(newVal) {
        this._shininessMaskInvert = newVal;
      },
      set lightEmissionMask(newVal) {
        this._lightEmissionMask = newVal;
      },
      set lightEmissionMaskChannel(newVal) {
        this._lightEmissionMaskChannel = newVal;
      },
      set lightEmissionMaskInvert(newVal) {
        this._lightEmissionMaskInvert = newVal;
      },
      set reflectionMask(newVal) {
        this._reflectionMask = newVal;
      },
      set reflectionMaskChannel(newVal) {
        this._reflectionMaskChannel = newVal;
      },
      set reflectionMaskInvert(newVal) {
        this._reflectionMaskInvert = newVal;
      },
      set cullFace(newVal) {
        this._cullFace = newVal;
      },
      set roughness(newVal) {
        this._roughness = newVal;
      },
      set roughnessMask(newVal) {
        this._roughnessMask = newVal;
      },
      set roughnessMaskChannel(newVal) {
        this._roughnessMaskChannel = newVal;
      },
      set roughnessMaskInvert(newVal) {
        this._roughnessMaskInvert = newVal;
      },
      get unlit() {
        return this._unlit;
      },
      set unlit(u) {
        this._unlit = u;
      },
      get selectMode() {
        return this._selectMode;
      },
      set selectMode(s) {
        this._selectMode = s;
      },
      get lightEmissionMaskChannelVector() {
        return channelVector(this.lightEmissionMaskChannel);
      },
      get shininessMaskChannelVector() {
        return channelVector(this.shininessMaskChannel);
      },
      get reflectionMaskChannelVector() {
        return channelVector(this.reflectionMaskChannel);
      },
      get roughnessMaskChannelVector() {
        return channelVector(this.roughnessMaskChannel);
      },
      copyMaterialSettings: function(mat, mask) {
        if (mask & bg.base.MaterialFlag.DIFFUSE) {
          mat.diffuse = this.diffuse;
        }
        if (mask & bg.base.MaterialFlag.SPECULAR) {
          mat.specular = this.specular;
        }
        if (mask & bg.base.MaterialFlag.SHININESS) {
          mat.shininess = this.shininess;
        }
        if (mask & bg.base.MaterialFlag.LIGHT_EMISSION) {
          mat.lightEmission = this.lightEmission;
        }
        if (mask & bg.base.MaterialFlag.REFRACTION_AMOUNT) {
          mat.refractionAmount = this.refractionAmount;
        }
        if (mask & bg.base.MaterialFlag.REFLECTION_AMOUNT) {
          mat.reflectionAmount = this.reflectionAmount;
        }
        if (mask & bg.base.MaterialFlag.TEXTURE) {
          mat.texture = this.texture;
        }
        if (mask & bg.base.MaterialFlag.LIGHT_MAP) {
          mat.lightmap = this.lightmap;
        }
        if (mask & bg.base.MaterialFlag.NORMAL_MAP) {
          mat.normalMap = this.normalMap;
        }
        if (mask & bg.base.MaterialFlag.TEXTURE_OFFSET) {
          mat.textureOffset = this.textureOffset;
        }
        if (mask & bg.base.MaterialFlag.TEXTURE_SCALE) {
          mat.textureScale = this.textureScale;
        }
        if (mask & bg.base.MaterialFlag.LIGHT_MAP_OFFSET) {
          mat.lightmapOffset = this.lightmapOffset;
        }
        if (mask & bg.base.MaterialFlag.LIGHT_MAP_SCALE) {
          mat.lightmapScale = this.lightmapScale;
        }
        if (mask & bg.base.MaterialFlag.NORMAL_MAP_OFFSET) {
          mat.normalMapOffset = this.normalMapOffset;
        }
        if (mask & bg.base.MaterialFlag.NORMAL_MAP_SCALE) {
          mat.normalMapScale = this.normalMapScale;
        }
        if (mask & bg.base.MaterialFlag.CAST_SHADOWS) {
          mat.castShadows = this.castShadows;
        }
        if (mask & bg.base.MaterialFlag.RECEIVE_SHADOWS) {
          mat.receiveShadows = this.receiveShadows;
        }
        if (mask & bg.base.MaterialFlag.ALPHA_CUTOFF) {
          mat.alphaCutoff = this.alphaCutoff;
        }
        if (mask & bg.base.MaterialFlag.SHININESS_MASK) {
          mat.shininessMask = this.shininessMask;
        }
        if (mask & bg.base.MaterialFlag.SHININESS_MASK_CHANNEL) {
          mat.shininessMaskChannel = this.shininessMaskChannel;
        }
        if (mask & bg.base.MaterialFlag.SHININESS_MASK_INVERT) {
          mat.shininessMaskInvert = this.shininessMaskInvert;
        }
        if (mask & bg.base.MaterialFlag.LIGHT_EMISSION_MASK) {
          mat.lightEmissionMask = this.lightEmissionMask;
        }
        if (mask & bg.base.MaterialFlag.LIGHT_EMISSION_MASK_CHANNEL) {
          mat.lightEmissionMaskChannel = this.lightEmissionMaskChannel;
        }
        if (mask & bg.base.MaterialFlag.LIGHT_EMISSION_MASK_INVERT) {
          mat.lightEmissionMaskInvert = this.lightEmissionMaskInvert;
        }
        if (mask & bg.base.MaterialFlag.REFLECTION_MASK) {
          mat.reflectionMask = this.reflectionMask;
        }
        if (mask & bg.base.MaterialFlag.REFLECTION_MASK_CHANNEL) {
          mat.reflectionMaskChannel = this.reflectionMaskChannel;
        }
        if (mask & bg.base.MaterialFlag.REFLECTION_MASK_INVERT) {
          mat.reflectionMaskInvert = this.reflectionMaskInvert;
        }
        if (mask & bg.base.MaterialFlag.CULL_FACE) {
          mat.cullFace = this.cullFace;
        }
        if (mask & bg.base.MaterialFlag.ROUGHNESS) {
          mat.reflectionAmount = this.reflectionAmount;
          mat.reflectionMask = this.reflectionMask;
          mat.reflectionMaskChannel = this.reflectionMaskChannel;
          mat.reflectionMaskInvert = this.reflectionMaskInvert;
        }
        if (mask & bg.base.MaterialFlag.UNLIT) {
          mat.unlit = this.unlit;
        }
      },
      applyModifier: function(context, mod, resourcePath) {
        if (mod.isEnabled(bg.base.MaterialFlag.DIFFUSE)) {
          this.diffuse = mod.diffuse;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.SPECULAR)) {
          this.specular = mod.specular;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.SHININESS)) {
          this.shininess = mod.shininess;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION)) {
          this.lightEmission = mod.lightEmission;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.REFRACTION_AMOUNT)) {
          this.refractionAmount = mod.refractionAmount;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_AMOUNT)) {
          this.reflectionAmount = mod.reflectionAmount;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE)) {
          this.texture = getTexture(context, mod.texture, resourcePath);
        }
        if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_MAP)) {
          this.lightmap = getTexture(context, mod.lightmap, resourcePath);
        }
        if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP)) {
          this.normalMap = getTexture(context, mod.normalMap, resourcePath);
        }
        if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE_OFFSET)) {
          this.textureOffset = mod.textureOffset;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE_SCALE)) {
          this.textureScale = mod.textureScale;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_MAP_OFFSET)) {
          this.lightmapOffset = mod.lightmapOffset;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_MAP_SCALE)) {
          this.lightmapScale = mod.lightmapScale;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP_OFFSET)) {
          this.normalMapOffset = mod.normalMapOffset;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP_SCALE)) {
          this.normalMapScale = mod.normalMapScale;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.CAST_SHADOWS)) {
          this.castShadows = mod.castShadows;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.RECEIVE_SHADOWS)) {
          this.receiveShadows = mod.receiveShadows;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.ALPHA_CUTOFF)) {
          this.alphaCutoff = mod.alphaCutoff;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.SHININESS_MASK)) {
          this.shininessMask = getTexture(context, mod.shininessMask, resourcePath);
        }
        if (mod.isEnabled(bg.base.MaterialFlag.SHININESS_MASK_CHANNEL)) {
          this.shininessMaskChannel = mod.shininessMaskChannel;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.SHININESS_MASK_INVERT)) {
          this.shininessMaskInvert = mod.shininessMaskInvert;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK)) {
          this.lightEmissionMask = getTexture(context, mod.lightEmissionMask, resourcePath);
        }
        if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK_CHANNEL)) {
          this.lightEmissionMaskChannel = mod.lightEmissionMaskChannel;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK_INVERT)) {
          this.lightEmissionMaskInvert = mod.lightEmissionMaskInvert;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_MASK)) {
          this.reflectionMask = getTexture(context, mod.reflectionMask, resourcePath);
        }
        if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_MASK_CHANNEL)) {
          this.reflectionMaskChannel = mod.reflectionMaskChannel;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_MASK_INVERT)) {
          this.reflectionMaskInvert = mod.reflectionMaskInvert;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.CULL_FACE)) {
          this.cullFace = mod.cullFace;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.ROUGHNESS)) {
          this.roughness = mod.roughness;
          this.roughnessMask = getTexture(context, mod.roughnessMask, resourcePath);
          this.roughnessMaskChannel = mod.roughnessMaskChannel;
          this.roughnessMaskInvert = mod.roughnessMaskInvert;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.UNLIT)) {
          this.unlit = mod.unlit;
        }
      },
      getModifierWithMask: function(modifierMask) {
        var mod = new MaterialModifier();
        if (mod.isEnabled(bg.base.MaterialFlag.DIFFUSE)) {
          mod.diffuse = this.diffuse;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.SPECULAR)) {
          mod.specular = this.specular;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.SHININESS)) {
          mod.shininess = this.shininess;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION)) {
          mod.lightEmission = this.lightEmission;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.REFRACTION_AMOUNT)) {
          mod.refractionAmount = this.refractionAmount;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_AMOUNT)) {
          mod.reflectionAmount = this.reflectionAmount;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE)) {
          mod.texture = getPath(this.texture);
        }
        if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_MAP)) {
          mod.lightmap = getPath(this.lightmap);
        }
        if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP)) {
          mod.normalMap = getPath(this.normalMap);
        }
        if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE_OFFSET)) {
          mod.textureOffset = this.textureOffset;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.TEXTURE_SCALE)) {
          mod.textureScale = this.textureScale;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_MAP_OFFSET)) {
          mod.lightmapOffset = this.lightmapOffset;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_MAP_SCALE)) {
          mod.lightmapScale = this.lightmapScale;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP_OFFSET)) {
          mod.normalMapOffset = this.normalMapOffset;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.NORMAL_MAP_SCALE)) {
          mod.normalMapScale = this.normalMapScale;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.CAST_SHADOWS)) {
          mod.castShadows = this.castShadows;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.RECEIVE_SHADOWS)) {
          mod.receiveShadows = this.receiveShadows;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.ALPHA_CUTOFF)) {
          mod.alphaCutoff = this.alphaCutoff;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.SHININESS_MASK)) {
          mod.shininessMask = getPath(this.shininessMask);
        }
        if (mod.isEnabled(bg.base.MaterialFlag.SHININESS_MASK_CHANNEL)) {
          mod.shininessMaskChannel = this.shininessMaskChannel;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.SHININESS_MASK_INVERT)) {
          mod.shininessMaskInvert = this.shininessMaskInvert;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK)) {
          mod.lightEmissionMask = getPath(this.lightEmissionMask);
        }
        if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK_CHANNEL)) {
          mod.lightEmissionMaskChannel = this.lightEmissionMaskChannel;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.LIGHT_EMISSION_MASK_INVERT)) {
          mod.lightEmissionMaskInver = this.lightEmissionMaskInver;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_MASK)) {
          mod.reflectionMask = getPath(this.reflectionMask);
        }
        if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_MASK_CHANNEL)) {
          mod.reflectionMaskChannel = this.reflectionMaskChannel;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.REFLECTION_MASK_INVERT)) {
          mod.reflectionMaskInvert = this.reflectionMaskInvert;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.CULL_FACE)) {
          mod.cullFace = this.cullFace;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.ROUGHNESS)) {
          mod.roughness = this.roughness;
          mod.roughnessMask = getPath(this.roughnessMask);
          mod.roughnessMaskChannel = this.roughnessMaskChannel;
          mod.roughnessMaskInvert = this.roughnessMaskInvert;
        }
        if (mod.isEnabled(bg.base.MaterialFlag.UNLIT)) {
          mod.unlit = this.unlit;
        }
        mod.setFlags(modifierMask);
      }
    }, {
      FromMaterialDefinition: function(context, def) {
        var basePath = arguments[2] !== (void 0) ? arguments[2] : "";
        return new Promise(function(resolve, reject) {
          var mat = new Material();
          mat.diffuse = readVector(def.diffuse) || bg.Color.White();
          mat.specular = readVector(def.specular) || bg.Color.White();
          mat.shininess = def.shininess || 0;
          mat.shininessMaskChannel = def.shininessMaskChannel || 0;
          mat.shininessMaskInvert = def.shininessMaskInvert || false;
          mat.lightEmission = def.lightEmission || 0;
          mat.lightEmissionMaskChannel = def.lightEmissionMaskChannel || 0;
          mat.lightEmissionMaskInvert = def.lightEmissionMaskInvert || false;
          mat.refractionAmount = def.refractionAmount || 0;
          mat.reflectionAmount = def.reflectionAmount || 0;
          mat.reflectionMaskChannel = def.reflectionMaskChannel || 0;
          mat.reflectionMaskInvert = def.reflectionMaskInvert || false;
          mat.textureOffset = readVector(def.textureOffset) || new bg.Vector2(0, 0);
          mat.textureScale = readVector(def.textureScale) || new bg.Vector2(1, 1);
          mat.normalMapOffset = readVector(def.normalMapOffset) || new bg.Vector2(0, 0);
          mat.normalMapScale = readVector(def.normalMapScale) || new bg.Vector2(1, 1);
          mat.cullFace = def.cullFace === undefined ? true : def.cullFace;
          mat.castShadows = def.castShadows === undefined ? true : def.castShadows;
          mat.receiveShadows = def.receiveShadows === undefined ? true : def.receiveShadows;
          mat.alphaCutoff = def.alphaCutoff === undefined ? 0.5 : def.alphaCutoff;
          mat.name = def.name;
          mat.description = def.description;
          mat.roughness = def.roughness || 0;
          mat.roughnessMaskChannel = def.roughnessMaskChannel || 0;
          mat.roughnessMaskInvert = def.roughnessMaskInvert || false;
          mat.unlit = def.unlit || false;
          var texPromises = [];
          texPromises.push(readTexture(context, basePath, def.shininessMask, mat, "shininessMask"));
          texPromises.push(readTexture(context, basePath, def.lightEmissionMask, mat, "lightEmissionMask"));
          texPromises.push(readTexture(context, basePath, def.reflectionMask, mat, "reflectionMask"));
          texPromises.push(readTexture(context, basePath, def.texture, mat, "texture"));
          texPromises.push(readTexture(context, basePath, def.normalMap, mat, "normalMap"));
          texPromises.push(readTexture(context, basePath, def.roughnessMask, mat, "roughnessMask"));
          Promise.all(texPromises).then(function() {
            resolve(mat);
          });
        });
      },
      GetMaterialWithJson: function(context, data, path) {
        var material = new Material();
        if (data.cullFace === undefined) {
          data.cullFace = true;
        }
        material.diffuse.set(data.diffuseR, data.diffuseG, data.diffuseB, data.diffuseA);
        material.specular.set(data.specularR, data.specularG, data.specularB, data.specularA);
        material.shininess = data.shininess;
        material.lightEmission = data.lightEmission;
        material.refractionAmount = data.refractionAmount;
        material.reflectionAmount = data.reflectionAmount;
        material.textureOffset.set(data.textureOffsetX, data.textureOffsetY);
        material.textureScale.set(data.textureScaleX, data.textureScaleY);
        material.lightmapOffset.set(data.lightmapOffsetX, data.lightmapOffsetY);
        material.lightmapScale.set(data.lightmapScaleX, data.lightmapScaleY);
        material.normalMapOffset.set(data.normalMapOffsetX, data.normalMapOffsetY);
        material.normalMapScale.set(data.normalMapScaleX, data.normalMapScaleY);
        material.alphaCutoff = data.alphaCutoff;
        material.castShadows = data.castShadows;
        material.receiveShadows = data.receiveShadows;
        material.shininessMaskChannel = data.shininessMaskChannel;
        material.shininessMaskInvert = data.invertShininessMask;
        material.lightEmissionMaskChannel = data.lightEmissionMaskChannel;
        material.lightEmissionMaskInvert = data.invertLightEmissionMask;
        material.reflectionMaskChannel = data.reflectionMaskChannel;
        material.reflectionMaskInvert = data.invertReflectionMask;
        material.roughness = data.roughness;
        material.roughnessMaskChannel = data.roughnessMaskChannel;
        material.roughnessMaskInvert = data.invertRoughnessMask;
        material.cullFace = data.cullFace;
        material.unlit = data.unlit;
        if (path && path[path.length - 1] != '/') {
          path += '/';
        }
        function mergePath(path, file) {
          if (!file)
            return null;
          return path ? path + file : file;
        }
        data.texture = mergePath(path, data.texture);
        data.lightmap = mergePath(path, data.lightmap);
        data.normalMap = mergePath(path, data.normalMap);
        data.shininessMask = mergePath(path, data.shininessMask);
        data.lightEmissionMask = mergePath(path, data.lightEmissionMask);
        data.reflectionMask = mergePath(path, data.reflectionMask);
        data.roughnessMask = mergePath(path, data.roughnessMask);
        return new Promise(function(accept, reject) {
          var textures = [];
          if (data.texture) {
            textures.push(data.texture);
          }
          if (data.lightmap && textures.indexOf(data.lightmap) == -1) {
            textures.push(data.lightmap);
          }
          if (data.normalMap && textures.indexOf(data.normalMap) == -1) {
            textures.push(data.normalMap);
          }
          if (data.shininessMask && textures.indexOf(data.shininessMask) == -1) {
            textures.push(data.shininessMask);
          }
          if (data.lightEmissionMask && textures.indexOf(data.lightEmissionMask) == -1) {
            textures.push(data.lightEmissionMask);
          }
          if (data.reflectionMask && textures.indexOf(data.reflectionMask) == -1) {
            textures.push(data.reflectionMask);
          }
          if (data.roughnessMask && textures.indexOf(data.roughnessMask) == -1) {
            textures.push(data.roughnessMask);
          }
          bg.utils.Resource.Load(textures).then(function(images) {
            material.texture = loadTexture(context, images[data.texture], data.texture);
            material.lightmap = loadTexture(context, images[data.lightmap], data.lightmap);
            material.normalMap = loadTexture(context, images[data.normalMap], data.normalMap);
            material.shininessMask = loadTexture(context, images[data.shininessMask], data.shininessMask);
            material.lightEmissionMask = loadTexture(context, images[data.lightEmissionMask], data.lightEmissionMask);
            material.reflectionMask = loadTexture(context, images[data.reflectionMask], data.reflectionMask);
            material.roughnessMask = loadTexture(context, images[data.roughnessMask], data.roughnessMask);
            accept(material);
          });
        });
      }
    });
  }();
  bg.base.Material = Material;
})();

"use strict";
(function() {
  var MatrixStack = function() {
    function MatrixStack() {
      this._matrix = bg.Matrix4.Identity();
      this._stack = [];
      this._changed = true;
    }
    return ($traceurRuntime.createClass)(MatrixStack, {
      get changed() {
        return this._changed;
      },
      set changed(c) {
        this._changed = c;
      },
      push: function() {
        this._stack.push(new bg.Matrix4(this._matrix));
      },
      set: function(m) {
        this._matrix.assign(m);
        this._changed = true;
        return this;
      },
      mult: function(m) {
        this._matrix.mult(m);
        this._changed = true;
        return this;
      },
      identity: function() {
        this._matrix.identity();
        this._changed = true;
        return this;
      },
      translate: function(x, y, z) {
        this._matrix.translate(x, y, z);
        this._changed = true;
        return this;
      },
      rotate: function(alpha, x, y, z) {
        this._matrix.rotate(alpha, x, y, z);
        this._changed = true;
        return this;
      },
      scale: function(x, y, z) {
        this._matrix.scale(x, y, z);
        this._changed = true;
        return this;
      },
      setScale: function(x, y, z) {
        this._matrix.setScale(x, y, z);
        this._changed = true;
        return this;
      },
      perspective: function(fov, aspect, near, far) {
        this._matrix.identity().perspective(fov, aspect, near, far);
        this._changed = true;
        return this;
      },
      frustum: function(left, right, bottom, top, nearPlane, farPlane) {
        this._matrix.identity().frustum(left, right, bottom, top, nearPlane, farPlane);
        this._changed = true;
        return this;
      },
      ortho: function(left, right, bottom, top, nearPlane, farPlane) {
        this._matrix.identity().ortho(left, right, bottom, top, nearPlane, farPlane);
        this._changed = true;
        return this;
      },
      invert: function() {
        this._matrix.invert();
        this._changed = true;
        return this;
      },
      get matrix() {
        this._changed = true;
        return this._matrix;
      },
      get matrixConst() {
        return this._matrix;
      },
      pop: function() {
        if (this._stack.length) {
          this._matrix.assign(this._stack.pop());
          this._changed = true;
        }
        return this._matrix;
      }
    }, {});
  }();
  bg.base.MatrixStack = MatrixStack;
  var s_MatrixState = null;
  var MatrixState = function() {
    function MatrixState() {
      this._modelMatrixStack = new MatrixStack();
      this._viewMatrixStack = new MatrixStack();
      this._projectionMatrixStack = new MatrixStack();
      this._modelViewMatrix = bg.Matrix4.Identity();
      this._normalMatrix = bg.Matrix4.Identity();
      this._cameraDistanceScale = null;
    }
    return ($traceurRuntime.createClass)(MatrixState, {
      get modelMatrixStack() {
        return this._modelMatrixStack;
      },
      get viewMatrixStack() {
        return this._viewMatrixStack;
      },
      get projectionMatrixStack() {
        return this._projectionMatrixStack;
      },
      get modelViewMatrix() {
        if (!this._modelViewMatrix || this._modelMatrixStack.changed || this._viewMatrixStack.changed) {
          this._modelViewMatrix = new bg.Matrix4(this._viewMatrixStack._matrix);
          this._modelViewMatrix.mult(this._modelMatrixStack._matrix);
          this._modelMatrixStack.changed = false;
          this._viewMatrixStack.changed = false;
        }
        return this._modelViewMatrix;
      },
      get normalMatrix() {
        if (!this._normalMatrix || this._modelMatrixStack.changed || this._viewMatrixStack.changed) {
          this._normalMatrix = new bg.Matrix4(this.modelViewMatrix);
          this._normalMatrix.invert();
          this._normalMatrix.traspose();
          this._modelMatrixStack.changed = false;
        }
        return this._normalMatrix;
      },
      get viewMatrixInvert() {
        if (!this._viewMatrixInvert || this._viewMatrixStack.changed) {
          this._viewMatrixInvert = new bg.Matrix4(this.viewMatrixStack.matrixConst);
          this._viewMatrixInvert.invert();
        }
        return this._viewMatrixInvert;
      },
      get cameraDistanceScale() {
        return this._cameraDistanceScale = this._viewMatrixStack.matrix.position.magnitude();
      }
    }, {
      Current: function() {
        if (!s_MatrixState) {
          s_MatrixState = new MatrixState();
        }
        return s_MatrixState;
      },
      SetCurrent: function(s) {
        s_MatrixState = s;
        return s_MatrixState;
      }
    });
  }();
  bg.base.MatrixState = MatrixState;
})();

"use strict";
(function() {
  bg.base.ClearBuffers = {
    COLOR: null,
    DEPTH: null,
    COLOR_DEPTH: null
  };
  bg.base.BlendMode = {
    NORMAL: 1,
    MULTIPLY: 2,
    ADD: 3,
    SUBTRACT: 4,
    ALPHA_ADD: 5,
    ALPHA_SUBTRACT: 6
  };
  bg.base.OpacityLayer = {
    TRANSPARENT: 1,
    OPAQUE: 2,
    GIZMOS: 4,
    SELECTION: 8,
    GIZMOS_SELECTION: 16,
    ALL: 15,
    NONE: 0
  };
  var PipelineImpl = function() {
    function PipelineImpl(context) {
      this.initFlags(context);
      bg.base.ClearBuffers.COLOR_DEPTH = bg.base.ClearBuffers.COLOR | bg.base.ClearBuffers.DEPTH;
    }
    return ($traceurRuntime.createClass)(PipelineImpl, {
      initFlags: function(context) {},
      setViewport: function(context, vp) {},
      clearBuffers: function(context, color, buffers) {},
      setDepthTestEnabled: function(context, e) {},
      setBlendEnabled: function(context, e) {},
      setBlendMode: function(context, m) {},
      setCullFace: function(context, e) {}
    }, {});
  }();
  bg.base.PipelineImpl = PipelineImpl;
  var s_currentPipeline = null;
  function enablePipeline(pipeline) {
    if (pipeline._effect) {
      pipeline._effect.setActive();
    }
    pipeline.renderSurface.setActive();
    bg.Engine.Get().pipeline.setViewport(pipeline.context, pipeline._viewport);
    bg.Engine.Get().pipeline.setDepthTestEnabled(pipeline.context, pipeline._depthTest);
    bg.Engine.Get().pipeline.setCullFace(pipeline.context, pipeline._cullFace);
    bg.Engine.Get().pipeline.setBlendEnabled(pipeline.context, pipeline._blend);
    bg.Engine.Get().pipeline.setBlendMode(pipeline.context, pipeline._blendMode);
  }
  var Pipeline = function($__super) {
    function Pipeline(context) {
      $traceurRuntime.superConstructor(Pipeline).call(this, context);
      this._opacityLayer = bg.base.OpacityLayer.ALL;
      this._viewport = new bg.Viewport(0, 0, 200, 200);
      this._clearColor = bg.Color.Black();
      this._effect = null;
      this._textureEffect = null;
      this._depthTest = true;
      this._cullFace = true;
      this._renderSurface = null;
      this._blend = false;
      this._blendMode = bg.base.BlendMode.NORMAL;
      this._buffersToClear = bg.base.ClearBuffers.COLOR_DEPTH;
    }
    return ($traceurRuntime.createClass)(Pipeline, {
      get isCurrent() {
        return s_currentPipeline == this;
      },
      set opacityLayer(l) {
        this._opacityLayer = l;
      },
      get opacityLayer() {
        return this._opacityLayer;
      },
      shouldDraw: function(material) {
        return material && ((material.isTransparent && (this._opacityLayer & bg.base.OpacityLayer.TRANSPARENT) != 0) || (!material.isTransparent && (this._opacityLayer & bg.base.OpacityLayer.OPAQUE) != 0));
      },
      get effect() {
        return this._effect;
      },
      set effect(m) {
        this._effect = m;
        if (this._effect && this.isCurrent) {
          this._effect.setActive();
        }
      },
      get textureEffect() {
        if (!this._textureEffect) {
          this._textureEffect = new bg.base.DrawTextureEffect(this.context);
        }
        return this._textureEffect;
      },
      set textureEffect(t) {
        this._textureEffect = t;
      },
      set buffersToClear(b) {
        this._buffersToClear = b;
      },
      get buffersToClear() {
        return this._buffersToClear;
      },
      get renderSurface() {
        if (!this._renderSurface) {
          this._renderSurface = new bg.base.ColorSurface(this.context);
          this._renderSurface.setActive();
        }
        return this._renderSurface;
      },
      set renderSurface(r) {
        this._renderSurface = r;
        if (this.isCurrent) {
          this._renderSurface.setActive();
        }
      },
      draw: function(polyList) {
        if (this._effect && polyList && this.isCurrent) {
          var cf = this.cullFace;
          this._effect.bindPolyList(polyList);
          if (this._effect.material) {
            this.cullFace = this._effect.material.cullFace;
          }
          polyList.draw();
          this._effect.unbind();
          this.cullFace = cf;
        }
      },
      drawTexture: function(texture) {
        var depthTest = this.depthTest;
        this.depthTest = false;
        this.textureEffect.drawSurface(texture);
        this.depthTest = depthTest;
      },
      get blend() {
        return this._blend;
      },
      set blend(b) {
        this._blend = b;
        if (this.isCurrent) {
          bg.Engine.Get().pipeline.setBlendEnabled(this.context, this._blend);
        }
      },
      get blendMode() {
        return this._blendMode;
      },
      set blendMode(b) {
        this._blendMode = b;
        if (this.isCurrent) {
          bg.Engine.Get().pipeline.setBlendMode(this.context, this._blendMode);
        }
      },
      get viewport() {
        return this._viewport;
      },
      set viewport(vp) {
        this._viewport = vp;
        if (this.renderSurface.resizeOnViewportChanged) {
          this.renderSurface.size = new bg.Vector2(vp.width, vp.height);
        }
        if (this.isCurrent) {
          bg.Engine.Get().pipeline.setViewport(this.context, this._viewport);
        }
      },
      clearBuffers: function(buffers) {
        if (this.isCurrent) {
          buffers = buffers !== undefined ? buffers : this._buffersToClear;
          bg.Engine.Get().pipeline.clearBuffers(this.context, this._clearColor, buffers);
        }
      },
      get clearColor() {
        return this._clearColor;
      },
      set clearColor(c) {
        this._clearColor = c;
      },
      get depthTest() {
        return this._depthTest;
      },
      set depthTest(e) {
        this._depthTest = e;
        if (this.isCurrent) {
          bg.Engine.Get().pipeline.setDepthTestEnabled(this.context, this._depthTest);
        }
      },
      get cullFace() {
        return this._cullFace;
      },
      set cullFace(c) {
        this._cullFace = c;
        if (this.isCurrent) {
          bg.Engine.Get().pipeline.setCullFace(this.context, this._cullFace);
        }
      }
    }, {
      SetCurrent: function(p) {
        s_currentPipeline = p;
        if (s_currentPipeline) {
          enablePipeline(s_currentPipeline);
        }
      },
      Current: function() {
        return s_currentPipeline;
      }
    }, $__super);
  }(bg.app.ContextObject);
  bg.base.Pipeline = Pipeline;
})();

"use strict";
(function() {
  bg.base.BufferType = {
    VERTEX: 1 << 0,
    NORMAL: 1 << 1,
    TEX_COORD_0: 1 << 2,
    TEX_COORD_1: 1 << 3,
    TEX_COORD_2: 1 << 4,
    COLOR: 1 << 5,
    TANGENT: 1 << 6,
    INDEX: 1 << 7
  };
  var PolyListImpl = function() {
    function PolyListImpl(context) {
      this.initFlags(context);
    }
    return ($traceurRuntime.createClass)(PolyListImpl, {
      initFlags: function(context) {},
      create: function(context) {},
      build: function(context, plist, vert, norm, t0, t1, t2, col, tan, index) {
        return false;
      },
      draw: function(context, plist, drawMode, numberOfIndex) {},
      destroy: function(context, plist) {},
      update: function(context, plist, bufferType, newData) {}
    }, {});
  }();
  function createTangents(plist) {
    if (!plist.texCoord0 || !plist.vertex)
      return;
    plist._tangent = [];
    var result = [];
    var generatedIndexes = {};
    if (plist.index.length % 3 == 0) {
      for (var i = 0; i < plist.index.length - 2; i += 3) {
        var v0i = plist.index[i] * 3;
        var v1i = plist.index[i + 1] * 3;
        var v2i = plist.index[i + 2] * 3;
        var t0i = plist.index[i] * 2;
        var t1i = plist.index[i + 1] * 2;
        var t2i = plist.index[i + 2] * 2;
        var v0 = new bg.Vector3(plist.vertex[v0i], plist.vertex[v0i + 1], plist.vertex[v0i + 2]);
        var v1 = new bg.Vector3(plist.vertex[v1i], plist.vertex[v1i + 1], plist.vertex[v1i + 2]);
        var v2 = new bg.Vector3(plist.vertex[v2i], plist.vertex[v2i + 1], plist.vertex[v2i + 2]);
        var t0 = new bg.Vector2(plist.texCoord0[t0i], plist.texCoord0[t0i + 1]);
        var t1 = new bg.Vector2(plist.texCoord0[t1i], plist.texCoord0[t1i + 1]);
        var t2 = new bg.Vector2(plist.texCoord0[t2i], plist.texCoord0[t2i + 1]);
        var edge1 = (new bg.Vector3(v1)).sub(v0);
        var edge2 = (new bg.Vector3(v2)).sub(v0);
        var deltaU1 = t1.x - t0.x;
        var deltaV1 = t1.y - t0.y;
        var deltaU2 = t2.x - t0.x;
        var deltaV2 = t2.y - t0.y;
        var f = 1 / (deltaU1 * deltaV2 - deltaU2 * deltaV1);
        var tangent = new bg.Vector3(f * (deltaV2 * edge1.x - deltaV1 * edge2.x), f * (deltaV2 * edge1.y - deltaV1 * edge2.y), f * (deltaV2 * edge1.z - deltaV1 * edge2.z));
        tangent.normalize();
        if (generatedIndexes[v0i] === undefined) {
          result.push(tangent.x);
          result.push(tangent.y);
          result.push(tangent.z);
          generatedIndexes[v0i] = tangent;
        }
        if (generatedIndexes[v1i] === undefined) {
          result.push(tangent.x);
          result.push(tangent.y);
          result.push(tangent.z);
          generatedIndexes[v1i] = tangent;
        }
        if (generatedIndexes[v2i] === undefined) {
          result.push(tangent.x);
          result.push(tangent.y);
          result.push(tangent.z);
          generatedIndexes[v2i] = tangent;
        }
      }
    } else {
      for (var i$__2 = 0; i$__2 < plist.vertex.length; i$__2 += 3) {
        plist._tangent.push(0, 0, 1);
      }
    }
    return result;
  }
  bg.base.PolyListImpl = PolyListImpl;
  bg.base.DrawMode = {
    TRIANGLES: null,
    TRIANGLE_FAN: null,
    TRIANGLE_STRIP: null,
    LINES: null,
    LINE_STRIP: null
  };
  var PolyList = function($__super) {
    function PolyList(context) {
      $traceurRuntime.superConstructor(PolyList).call(this, context);
      this._plist = null;
      this._drawMode = bg.base.DrawMode.TRIANGLES;
      this._name = "";
      this._groupName = "";
      this._visible = true;
      this._vertex = [];
      this._normal = [];
      this._texCoord0 = [];
      this._texCoord1 = [];
      this._texCoord2 = [];
      this._color = [];
      this._tangent = [];
      this._index = [];
    }
    return ($traceurRuntime.createClass)(PolyList, {
      clone: function() {
        var pl2 = new PolyList(this.context);
        var copy = function(src, dst) {
          src.forEach(function(item) {
            dst.push(item);
          });
        };
        pl2.name = this.name + " clone";
        pl2.groupName = this.groupName;
        pl2.visible = this.visible;
        pl2.drawMode = this.drawMode;
        copy(this.vertex, pl2.vertex);
        copy(this.normal, pl2.normal);
        copy(this.texCoord0, pl2.texCoord0);
        copy(this.texCoord1, pl2.texCoord1);
        copy(this.texCoord2, pl2.texCoord02);
        copy(this.color, pl2.color);
        copy(this.index, pl2.index);
        pl2.build();
        return pl2;
      },
      get name() {
        return this._name;
      },
      set name(n) {
        this._name = n;
      },
      get groupName() {
        return this._groupName;
      },
      set groupName(n) {
        this._groupName = n;
      },
      get visible() {
        return this._visible;
      },
      set visible(v) {
        this._visible = v;
      },
      get drawMode() {
        return this._drawMode;
      },
      set drawMode(m) {
        this._drawMode = m;
      },
      set vertex(v) {
        this._vertex = v;
      },
      set normal(n) {
        this._normal = n;
      },
      set texCoord0(t) {
        this._texCoord0 = t;
      },
      set texCoord1(t) {
        this._texCoord1 = t;
      },
      set texCoord2(t) {
        this._texCoord2 = t;
      },
      set color(c) {
        this._color = c;
      },
      set index(i) {
        this._index = i;
      },
      get vertex() {
        return this._vertex;
      },
      get normal() {
        return this._normal;
      },
      get texCoord0() {
        return this._texCoord0;
      },
      get texCoord1() {
        return this._texCoord1;
      },
      get texCoord2() {
        return this._texCoord2;
      },
      get color() {
        return this._color;
      },
      get tangent() {
        return this._tangent;
      },
      get index() {
        return this._index;
      },
      get vertexBuffer() {
        return this._plist.vertexBuffer;
      },
      get normalBuffer() {
        return this._plist.normalBuffer;
      },
      get texCoord0Buffer() {
        return this._plist.tex0Buffer;
      },
      get texCoord1Buffer() {
        return this._plist.tex1Buffer;
      },
      get texCoord2Buffer() {
        return this._plist.tex2Buffer;
      },
      get colorBuffer() {
        return this._plist.colorBuffer;
      },
      get tangentBuffer() {
        return this._plist.tangentBuffer;
      },
      get indexBuffer() {
        return this._plist.indexBuffer;
      },
      updateBuffer: function(bufferType, newData) {
        var status = false;
        switch (bufferType) {
          case bg.base.BufferType.VERTEX:
            status = this.vertex.length == newData.length;
            break;
          case bg.base.BufferType.NORMAL:
            status = this.normal.length == newData.length;
            break;
          case bg.base.BufferType.TEX_COORD_0:
            status = this.texCoord0.length == newData.length;
            break;
          case bg.base.BufferType.TEX_COORD_1:
            status = this.texCoord1.length == newData.length;
            break;
          case bg.base.BufferType.TEX_COORD_2:
            status = this.texCoord2.length == newData.length;
            break;
          case bg.base.BufferType.COLOR:
            status = this.color.length == newData.length;
            break;
          case bg.base.BufferType.TANGENT:
            status = this.tangent.length == newData.length;
            break;
          case bg.base.BufferType.INDEX:
            status = this.index.length == newData.length;
            break;
        }
        if (!status) {
          throw new Error("Error updating buffer: The new buffer have different size as the old one.");
        } else {
          bg.Engine.Get().polyList.update(this.context, this._plist, bufferType, newData);
        }
      },
      build: function() {
        if (this.color.length == 0) {
          for (var i = 0; i < this.vertex.length; i += 3) {
            this.color.push(1);
            this.color.push(1);
            this.color.push(1);
            this.color.push(1);
          }
        }
        var plistImpl = bg.Engine.Get().polyList;
        if (this._plist) {
          plistImpl.destroy(this.context, this._plist);
          this._tangent = [];
        }
        this._tangent = createTangents(this);
        this._plist = plistImpl.create(this.context);
        return plistImpl.build(this.context, this._plist, this._vertex, this._normal, this._texCoord0, this._texCoord1, this._texCoord2, this._color, this._tangent, this._index);
      },
      draw: function() {
        bg.Engine.Get().polyList.draw(this.context, this._plist, this.drawMode, this.index.length);
      },
      destroy: function() {
        if (this._plist) {
          bg.Engine.Get().polyList.destroy(this.context, this._plist);
        }
        this._plist = null;
        this._name = "";
        this._vertex = [];
        this._normal = [];
        this._texCoord0 = [];
        this._texCoord1 = [];
        this._texCoord2 = [];
        this._color = [];
        this._tangent = [];
        this._index = [];
      },
      applyTransform: function(trx) {
        var transform = new bg.Matrix4(trx);
        var rotation = new bg.Matrix4(trx.getMatrix3());
        if (this.normal.length > 0 && this.normal.length != this.vertex.length)
          throw new Error("Unexpected number of normal coordinates found in polyList");
        for (var i = 0; i < this.vertex.length - 2; i += 3) {
          var vertex = new bg.Vector4(this.vertex[i], this.vertex[i + 1], this.vertex[i + 2], 1.0);
          vertex = transform.multVector(vertex);
          this.vertex[i] = vertex.x;
          this.vertex[i + 1] = vertex.y;
          this.vertex[i + 2] = vertex.z;
          if (this.normal.length) {
            var normal = new bg.Vector4(this.normal[i], this.normal[i + 1], this.normal[i + 2], 1.0);
            normal = rotation.multVector(normal);
            this.normal[i] = normal.x;
            this.normal[i + 1] = normal.y;
            this.normal[i + 2] = normal.z;
          }
        }
        this.build();
      }
    }, {}, $__super);
  }(bg.app.ContextObject);
  ;
  bg.base.PolyList = PolyList;
})();

"use strict";
(function() {
  var shaders = {};
  function lib() {
    return bg.base.ShaderLibrary.Get();
  }
  var s_vertexSource = null;
  var s_fragmentSource = null;
  function vertexShaderSource() {
    if (!s_vertexSource) {
      s_vertexSource = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
      s_vertexSource.addParameter([lib().inputs.buffers.vertex]);
      s_vertexSource.addParameter(lib().inputs.matrix.all);
      if (bg.Engine.Get().id == "webgl1") {
        s_vertexSource.setMainBody("\n\t\t\t\t\tgl_Position = inProjectionMatrix * inViewMatrix * inModelMatrix * vec4(inVertex,1.0);\n\t\t\t\t");
      }
    }
    return s_vertexSource;
  }
  function fragmentShaderSource() {
    if (!s_fragmentSource) {
      s_fragmentSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
      if (bg.Engine.Get().id == "webgl1") {
        s_fragmentSource.setMainBody("\n\t\t\t\t\tgl_FragColor = vec4(1.0,0.0,0.0,1.0);\n\t\t\t\t");
      }
    }
    return s_fragmentSource;
  }
  var RedEffect = function($__super) {
    function RedEffect(context) {
      $traceurRuntime.superConstructor(RedEffect).call(this, context);
      var sources = [vertexShaderSource(), fragmentShaderSource()];
      this.setupShaderSource(sources);
    }
    return ($traceurRuntime.createClass)(RedEffect, {
      beginDraw: function() {},
      setupVars: function() {
        var matrixState = bg.base.MatrixState.Current();
        var viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
        this.shader.setMatrix4('inModelMatrix', matrixState.modelMatrixStack.matrixConst);
        this.shader.setMatrix4('inViewMatrix', viewMatrix);
        this.shader.setMatrix4('inProjectionMatrix', matrixState.projectionMatrixStack.matrixConst);
      }
    }, {}, $__super);
  }(bg.base.Effect);
  bg.base.RedEffect = RedEffect;
})();

"use strict";
(function() {
  var RenderSurfaceBufferImpl = function() {
    function RenderSurfaceBufferImpl(context) {
      this.initFlags(context);
    }
    return ($traceurRuntime.createClass)(RenderSurfaceBufferImpl, {
      initFlags: function(context) {},
      create: function(context, attachments) {},
      setActive: function(context, renderSurface) {},
      readBuffer: function(context, renderSurface, rectangle) {},
      resize: function(context, renderSurface, size) {},
      destroy: function(context, renderSurface) {},
      supportType: function(type) {},
      supportFormat: function(format) {},
      maxColorAttachments: function() {}
    }, {});
  }();
  bg.base.RenderSurfaceBufferImpl = RenderSurfaceBufferImpl;
  var RenderSurface = function($__super) {
    function RenderSurface(context) {
      $traceurRuntime.superConstructor(RenderSurface).call(this, context);
      this._size = new bg.Vector2(256);
      this._renderSurface = null;
      this._resizeOnViewportChanged = true;
    }
    return ($traceurRuntime.createClass)(RenderSurface, {
      get size() {
        return this._size;
      },
      set size(s) {
        if (this._size.x != s.x || this._size.y != s.y) {
          this._size = s;
          this.surfaceImpl.resize(this.context, this._renderSurface, s);
        }
      },
      get surfaceImpl() {
        return null;
      },
      get resizeOnViewportChanged() {
        return this._resizeOnViewportChanged;
      },
      set resizeOnViewportChanged(r) {
        this._resizeOnViewportChanged = r;
      },
      create: function(attachments) {
        if (!attachments) {
          attachments = RenderSurface.DefaultAttachments();
        }
        this._renderSurface = this.surfaceImpl.create(this.context, attachments);
      },
      setActive: function() {
        this.surfaceImpl.setActive(this.context, this._renderSurface);
      },
      readBuffer: function(rectangle) {
        return this.surfaceImpl.readBuffer(this.context, this._renderSurface, rectangle, this.size);
      },
      destroy: function() {
        this.surfaceImpl.destroy(this.context, this._renderSurface);
        this._renderSurface = null;
      }
    }, {
      DefaultAttachments: function() {
        return [{
          type: bg.base.RenderSurfaceType.RGBA,
          format: bg.base.RenderSurfaceFormat.UNSIGNED_BYTE
        }, {
          type: bg.base.RenderSurfaceType.DEPTH,
          format: bg.base.RenderSurfaceFormat.RENDERBUFFER
        }];
      },
      SupportFormat: function(format) {
        return bg.Engine.Get().colorBuffer.supportFormat(format);
      },
      SupportType: function(type) {
        return bg.Engine.Get().colorBuffer.supportType(type);
      },
      MaxColorAttachments: function() {
        return bg.Engine.Get().textureBuffer.maxColorAttachments;
      }
    }, $__super);
  }(bg.app.ContextObject);
  bg.base.RenderSurface = RenderSurface;
  bg.base.RenderSurfaceType = {
    RGBA: null,
    DEPTH: null
  };
  bg.base.RenderSurfaceFormat = {
    UNSIGNED_BYTE: null,
    UNSIGNED_SHORT: null,
    FLOAT: null,
    RENDERBUFFER: null
  };
  var ColorSurface = function($__super) {
    function ColorSurface() {
      $traceurRuntime.superConstructor(ColorSurface).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(ColorSurface, {get surfaceImpl() {
        return bg.Engine.Get().colorBuffer;
      }}, {MaxColorAttachments: function() {
        return bg.Engine.Get().colorBuffer.maxColorAttachments;
      }}, $__super);
  }(RenderSurface);
  bg.base.ColorSurface = ColorSurface;
  var TextureSurface = function($__super) {
    function TextureSurface() {
      $traceurRuntime.superConstructor(TextureSurface).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(TextureSurface, {
      get surfaceImpl() {
        return bg.Engine.Get().textureBuffer;
      },
      getTexture: function() {
        var attachment = arguments[0] !== (void 0) ? arguments[0] : 0;
        return this._renderSurface.attachments[attachment] && this._renderSurface.attachments[attachment].texture;
      }
    }, {MaxColorAttachments: function() {
        return bg.Engine.Get().textureBuffer.maxColorAttachments;
      }}, $__super);
  }(RenderSurface);
  bg.base.TextureSurface = TextureSurface;
})();

"use strict";
(function() {
  if (!bg.isElectronApp) {
    return false;
  }
  var fs = require('fs');
  var path = require('path');
  var SaveSceneHelper = function() {
    function SaveSceneHelper() {}
    return ($traceurRuntime.createClass)(SaveSceneHelper, {
      save: function(filePath, sceneRoot) {
        var $__3 = this;
        filePath = bg.base.Writer.StandarizePath(filePath);
        return new Promise(function(resolve, reject) {
          $__3._url = {};
          $__3._url.path = filePath.split('/');
          $__3._url.fileName = $__3._url.path.pop();
          $__3._url.path = $__3._url.path.join('/');
          $__3._sceneData = {
            fileType: "vwgl::scene",
            version: {
              major: 2,
              minor: 0,
              rev: 0
            },
            scene: []
          };
          $__3._promises = [];
          bg.base.Writer.PrepareDirectory($__3._url.path);
          var rootNode = {};
          $__3._sceneData.scene.push(rootNode);
          $__3.buildSceneNode(sceneRoot, rootNode);
          fs.writeFileSync(path.join($__3._url.path, $__3._url.fileName), JSON.stringify($__3._sceneData, "", "\t"), "utf-8");
          Promise.all($__3._promises).then(function() {
            return resolve();
          }).catch(function(err) {
            return reject(err);
          });
        });
      },
      buildSceneNode: function(node, sceneData) {
        var $__3 = this;
        sceneData.type = "Node";
        sceneData.name = node.name;
        sceneData.enabled = node.enabled;
        sceneData.children = [];
        sceneData.components = [];
        node.forEachComponent(function(component) {
          if (component.shouldSerialize) {
            var componentData = {};
            component.serialize(componentData, $__3._promises, $__3._url);
            sceneData.components.push(componentData);
          }
        });
        node.children.forEach(function(child) {
          var childData = {};
          $__3.buildSceneNode(child, childData);
          sceneData.children.push(childData);
        });
      }
    }, {});
  }();
  ;
  var SceneWriterPlugin = function($__super) {
    function SceneWriterPlugin() {
      $traceurRuntime.superConstructor(SceneWriterPlugin).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(SceneWriterPlugin, {
      acceptType: function(url, data) {
        var ext = url.split(".").pop(".");
        return /vitscnj/i.test(ext) && data instanceof bg.scene.Node;
      },
      write: function(url, data) {
        var saveSceneHelper = new SaveSceneHelper();
        return saveSceneHelper.save(url, data);
      }
    }, {}, $__super);
  }(bg.base.WriterPlugin);
  bg.base.SceneWriterPlugin = SceneWriterPlugin;
})();

"use strict";
(function() {
  var s_shaderLibrary = null;
  function defineAll(obj) {
    Reflect.defineProperty(obj, "all", {get: function() {
        if (!this._all) {
          this._all = [];
          for (var key in obj) {
            if ($traceurRuntime.typeof((obj[key])) == "object" && obj[key].name) {
              this._all.push(obj[key]);
            }
          }
        }
        return this._all;
      }});
  }
  var ShaderLibrary = function() {
    function ShaderLibrary() {
      var library = bg[bg.Engine.Get().id].shaderLibrary;
      for (var key in library) {
        this[key] = library[key];
      }
      defineAll(this.inputs.matrix);
      Object.defineProperty(this.inputs.matrix, "modelViewProjection", {get: function() {
          return [this.model, this.view, this.projection];
        }});
      defineAll(this.inputs.material);
      defineAll(this.inputs.lighting);
      defineAll(this.inputs.lightingForward);
      defineAll(this.inputs.shadows);
      defineAll(this.inputs.colorCorrection);
      defineAll(this.functions.materials);
      defineAll(this.functions.colorCorrection);
      defineAll(this.functions.lighting);
      defineAll(this.functions.utils);
    }
    return ($traceurRuntime.createClass)(ShaderLibrary, {}, {Get: function() {
        if (!s_shaderLibrary) {
          s_shaderLibrary = new ShaderLibrary();
        }
        return s_shaderLibrary;
      }});
  }();
  bg.base.ShaderLibrary = ShaderLibrary;
  var ShaderSourceImpl = function() {
    function ShaderSourceImpl() {}
    return ($traceurRuntime.createClass)(ShaderSourceImpl, {
      header: function(shaderType) {
        return "";
      },
      parameter: function(shaderType, paramData) {
        return paramData.name;
      },
      func: function(shaderType, funcData) {
        return funcData.name;
      }
    }, {});
  }();
  bg.base.ShaderSourceImpl = ShaderSourceImpl;
  var ShaderSource = function() {
    function ShaderSource(type) {
      this._type = type;
      this._params = [];
      this._functions = [];
      this._requiredExtensions = [];
      this._header = "";
    }
    return ($traceurRuntime.createClass)(ShaderSource, {
      get type() {
        return this._type;
      },
      get params() {
        return this._params;
      },
      get header() {
        return this._header;
      },
      get functions() {
        return this._functions;
      },
      addParameter: function(param) {
        if (param instanceof Array) {
          this._params = $traceurRuntime.spread(this._params, param);
        } else {
          this._params.push(param);
        }
        this._params.push(null);
      },
      addFunction: function(func) {
        if (func instanceof Array) {
          this._functions = $traceurRuntime.spread(this._functions, func);
        } else {
          this._functions.push(func);
        }
      },
      setMainBody: function(body) {
        this.addFunction({
          returnType: "void",
          name: "main",
          params: {},
          body: body
        });
      },
      appendHeader: function(src) {
        this._header += src + "\n";
      },
      toString: function() {
        var $__3 = this;
        var impl = bg.Engine.Get().shaderSource;
        var src = impl.header(this.type) + "\n" + this._header + "\n\n";
        this.params.forEach(function(p) {
          src += impl.parameter($__3.type, p) + "\n";
        });
        this.functions.forEach(function(f) {
          src += "\n" + impl.func($__3.type, f) + "\n";
        });
        return src;
      }
    }, {FormatSource: function(src) {
        var result = "";
        var lines = src.replace(/^\n*/, "").replace(/\n*$/, "").split("\n");
        var minTabs = 100;
        lines.forEach(function(line) {
          var tabsInLine = /(\t*)/.exec(line)[0].length;
          if (minTabs > tabsInLine) {
            minTabs = tabsInLine;
          }
        });
        lines.forEach(function(line) {
          var tabsInLine = /(\t*)/.exec(line)[0].length;
          var diff = tabsInLine - minTabs;
          result += line.slice(tabsInLine - diff, line.length) + "\n";
        });
        return result.replace(/^\n*/, "").replace(/\n*$/, "");
      }});
  }();
  bg.base.ShaderSource = ShaderSource;
})();

"use strict";
(function() {
  var ShaderImpl = function() {
    function ShaderImpl(context) {
      this.initFlags(context);
    }
    return ($traceurRuntime.createClass)(ShaderImpl, {
      initFlags: function(context) {},
      setActive: function(context, shaderProgram) {},
      create: function(context) {},
      addShaderSource: function(context, shaderProgram, shaderType, source) {},
      link: function(context, shaderProgram) {},
      initVars: function(context, shader, inputBufferVars, valueVars) {},
      setInputBuffer: function(context, shader, varName, vertexBuffer, itemSize) {},
      setValueInt: function(context, shader, name, v) {},
      setValueIntPtr: function(context, shader, name, v) {},
      setValueFloat: function(context, shader, name, v) {},
      setValueFloatPtr: function(context, shader, name, v) {},
      setValueVector2: function(context, shader, name, v) {},
      setValueVector3: function(context, shader, name, v) {},
      setValueVector4: function(context, shader, name, v) {},
      setValueVector2v: function(context, shader, name, v) {},
      setValueVector3v: function(context, shader, name, v) {},
      setValueVector4v: function(context, shader, name, v) {},
      setValueMatrix3: function(context, shader, name, traspose, v) {},
      setValueMatrix4: function(context, shader, name, traspose, v) {},
      setTexture: function(context, shader, name, texture, textureUnit) {}
    }, {});
  }();
  bg.base.ShaderImpl = ShaderImpl;
  bg.base.ShaderType = {
    VERTEX: null,
    FRAGMENT: null
  };
  function addLineNumbers(source) {
    var result = "";
    source.split("\n").forEach(function(line, index) {
      ++index;
      var prefix = index < 10 ? "00" : index < 100 ? "0" : "";
      result += prefix + index + " | " + line + "\n";
    });
    return result;
  }
  var Shader = function($__super) {
    function Shader(context) {
      $traceurRuntime.superConstructor(Shader).call(this, context);
      this._shader = bg.Engine.Get().shader.create(context);
      this._linked = false;
      this._compileError = null;
      this._linkError = null;
    }
    return ($traceurRuntime.createClass)(Shader, {
      get shader() {
        return this._shader;
      },
      get compileError() {
        return this._compileError;
      },
      get compileErrorSource() {
        return this._compileErrorSource;
      },
      get linkError() {
        return this._linkError;
      },
      get status() {
        return this._compileError == null && this._linkError == null;
      },
      addShaderSource: function(shaderType, shaderSource) {
        if (this._linked) {
          this._compileError = "Tying to attach a shader to a linked program";
        } else if (!this._compileError) {
          this._compileError = bg.Engine.Get().shader.addShaderSource(this.context, this._shader, shaderType, shaderSource);
          if (this._compileError) {
            this._compileErrorSource = addLineNumbers(shaderSource);
          }
        }
        return this._compileError == null;
      },
      link: function() {
        this._linkError = null;
        if (this._linked) {
          this._linkError = "Shader already linked";
        } else {
          this._linkError = bg.Engine.Get().shader.link(this.context, this._shader);
          this._linked = this._linkError == null;
        }
        return this._linked;
      },
      setActive: function() {
        bg.Engine.Get().shader.setActive(this.context, this._shader);
      },
      clearActive: function() {
        Shader.ClearActive(this.context);
      },
      initVars: function(inputBufferVars, valueVars) {
        bg.Engine.Get().shader.initVars(this.context, this._shader, inputBufferVars, valueVars);
      },
      setInputBuffer: function(name, vbo, itemSize) {
        bg.Engine.Get().shader.setInputBuffer(this.context, this._shader, name, vbo, itemSize);
      },
      disableInputBuffer: function(name) {
        bg.Engine.Get().shader.disableInputBuffer(this.context, this._shader, name);
      },
      setValueInt: function(name, v) {
        bg.Engine.Get().shader.setValueInt(this.context, this._shader, name, v);
      },
      setValueIntPtr: function(name, v) {
        bg.Engine.Get().shader.setValueIntPtr(this.context, this._shader, name, v);
      },
      setValueFloat: function(name, v) {
        bg.Engine.Get().shader.setValueFloat(this.context, this._shader, name, v);
      },
      setValueFloatPtr: function(name, v) {
        bg.Engine.Get().shader.setValueFloatPtr(this.context, this._shader, name, v);
      },
      setVector2: function(name, v) {
        bg.Engine.Get().shader.setValueVector2(this.context, this._shader, name, v);
      },
      setVector3: function(name, v) {
        bg.Engine.Get().shader.setValueVector3(this.context, this._shader, name, v);
      },
      setVector4: function(name, v) {
        bg.Engine.Get().shader.setValueVector4(this.context, this._shader, name, v);
      },
      setVector2Ptr: function(name, v) {
        bg.Engine.Get().shader.setValueVector2v(this.context, this._shader, name, v);
      },
      setVector3Ptr: function(name, v) {
        bg.Engine.Get().shader.setValueVector3v(this.context, this._shader, name, v);
      },
      setVector4Ptr: function(name, v) {
        bg.Engine.Get().shader.setValueVector4v(this.context, this._shader, name, v);
      },
      setMatrix3: function(name, v) {
        var traspose = arguments[2] !== (void 0) ? arguments[2] : false;
        bg.Engine.Get().shader.setValueMatrix3(this.context, this._shader, name, traspose, v);
      },
      setMatrix4: function(name, v) {
        var traspose = arguments[2] !== (void 0) ? arguments[2] : false;
        bg.Engine.Get().shader.setValueMatrix4(this.context, this._shader, name, traspose, v);
      },
      setTexture: function(name, texture, textureUnit) {
        bg.Engine.Get().shader.setTexture(this.context, this._shader, name, texture, textureUnit);
      }
    }, {ClearActive: function(context) {
        bg.Engine.Get().shader.setActive(context, null);
      }}, $__super);
  }(bg.app.ContextObject);
  bg.base.Shader = Shader;
})();

"use strict";
(function() {
  function lib() {
    return bg.base.ShaderLibrary.Get();
  }
  var s_vertexSource = null;
  var s_fragmentSource = null;
  function vertexShaderSource() {
    if (!s_vertexSource) {
      s_vertexSource = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
      s_vertexSource.addParameter([lib().inputs.buffers.vertex, lib().inputs.buffers.tex0, null, lib().inputs.matrix.model, lib().inputs.matrix.view, lib().inputs.matrix.projection, null, {
        name: "fsTexCoord",
        dataType: "vec2",
        role: "out"
      }]);
      if (bg.Engine.Get().id == "webgl1") {
        s_vertexSource.setMainBody("\n\t\t\t\tgl_Position = inProjectionMatrix * inViewMatrix * inModelMatrix * vec4(inVertex,1.0);\n\t\t\t\tfsTexCoord = inTex0;\n\t\t\t\t");
      }
    }
    return s_vertexSource;
  }
  function fragmentShaderSource() {
    if (!s_fragmentSource) {
      s_fragmentSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
      s_fragmentSource.addParameter([lib().inputs.material.castShadows, lib().inputs.material.texture, lib().inputs.material.textureOffset, lib().inputs.material.textureScale, lib().inputs.material.alphaCutoff, null, {
        name: "fsTexCoord",
        dataType: "vec2",
        role: "in"
      }]);
      s_fragmentSource.addFunction(lib().functions.utils.pack);
      s_fragmentSource.addFunction(lib().functions.materials.samplerColor);
      if (bg.Engine.Get().id == "webgl1") {
        s_fragmentSource.setMainBody("\n\t\t\t\t\n\t\t\t\tfloat alpha = samplerColor(inTexture,fsTexCoord,inTextureOffset,inTextureScale).a;\n\t\t\t\tif (inCastShadows && alpha>inAlphaCutoff) {\n\t\t\t\t\tgl_FragColor = pack(gl_FragCoord.z);\n\t\t\t\t}\n\t\t\t\telse {\n\t\t\t\t\tdiscard;\n\t\t\t\t}");
      }
    }
    return s_fragmentSource;
  }
  var ShadowMapEffect = function($__super) {
    function ShadowMapEffect(context) {
      $traceurRuntime.superConstructor(ShadowMapEffect).call(this, context);
      this._material = null;
      this._light = null;
      this._lightTransform = null;
      this.setupShaderSource([vertexShaderSource(), fragmentShaderSource()]);
    }
    return ($traceurRuntime.createClass)(ShadowMapEffect, {
      get material() {
        return this._material;
      },
      set material(m) {
        this._material = m;
      },
      get light() {
        return this._light;
      },
      set light(l) {
        this._light = l;
      },
      get lightTransform() {
        return this._lightTransform;
      },
      set lightTransform(t) {
        this._lightTransform = t;
      },
      setupVars: function() {
        if (this.material && this.light && this.lightTransform) {
          var matrixState = bg.base.MatrixState.Current();
          this.shader.setMatrix4("inModelMatrix", matrixState.modelMatrixStack.matrixConst);
          this.shader.setMatrix4("inViewMatrix", this.lightTransform);
          this.shader.setMatrix4("inProjectionMatrix", this.light.projection);
          this.shader.setValueInt("inCastShadows", this.material.castShadows);
          var texture = this.material.texture || bg.base.TextureCache.WhiteTexture(this.context);
          this.shader.setTexture("inTexture", texture, bg.base.TextureUnit.TEXTURE_0);
          this.shader.setVector2("inTextureOffset", this.material.textureOffset);
          this.shader.setVector2("inTextureScale", this.material.textureScale);
          this.shader.setValueFloat("inAlphaCutoff", this.material.alphaCutoff);
        }
      }
    }, {}, $__super);
  }(bg.base.Effect);
  bg.base.ShadowMapEffect = ShadowMapEffect;
  bg.base.ShadowType = {
    HARD: 0,
    SOFT: 1,
    STRATIFIED: 2
  };
  bg.base.ShadowCascade = {
    NEAR: 0,
    FAR: 1,
    MID: 2
  };
  function updateDirectional(scene, camera, light, lightTransform, cascade) {
    var ms = bg.base.MatrixState.Current();
    bg.base.MatrixState.SetCurrent(this._matrixState);
    this._pipeline.effect.light = light;
    this._viewMatrix = new bg.Matrix4(lightTransform);
    var rotation = this._viewMatrix.rotation;
    var cameraTransform = camera.transform ? new bg.Matrix4(camera.transform.matrix) : bg.Matrix4.Identity();
    var cameraPos = cameraTransform.position;
    var target = cameraPos.add(cameraTransform.forwardVector.scale(-camera.focus));
    this._viewMatrix.identity().translate(target).mult(rotation).translate(0, 0, 10).invert();
    this._pipeline.effect.lightTransform = this._viewMatrix;
    bg.base.Pipeline.SetCurrent(this._pipeline);
    this._pipeline.clearBuffers(bg.base.ClearBuffers.COLOR_DEPTH);
    var mult = 1;
    if (cascade == bg.base.ShadowCascade.FAR) {
      mult = 20;
      light.shadowBias = 0.0001;
    } else if (cascade == bg.base.ShadowCascade.NEAR) {
      mult = 2;
      light.shadowBias = 0.00002;
    } else if (cascade == bg.base.ShadowCascade.MID) {
      mult = 4;
      light.shadowBias = 0.0001;
    }
    light.projection = bg.Matrix4.Ortho(-camera.focus * mult, camera.focus * mult, -camera.focus * mult, camera.focus * mult, 1, 300 * camera.focus);
    this._projection = light.projection;
    scene.accept(this._drawVisitor);
    bg.base.MatrixState.SetCurrent(ms);
  }
  function updateSpot(scene, camera, light, lightTransform) {
    var ms = bg.base.MatrixState.Current();
    bg.base.MatrixState.SetCurrent(this._matrixState);
    this._pipeline.effect.light = light;
    this._viewMatrix = new bg.Matrix4(lightTransform);
    var cutoff = light.spotCutoff;
    light.projection = bg.Matrix4.Perspective(cutoff * 2, 1, 0.1, 200.0);
    light.shadowBias = 0.0005;
    this._viewMatrix.invert();
    this._projection = light.projection;
    this._pipeline.effect.lightTransform = this._viewMatrix;
    bg.base.Pipeline.SetCurrent(this._pipeline);
    this._pipeline.clearBuffers(bg.base.ClearBuffers.COLOR_DEPTH);
    scene.accept(this._drawVisitor);
    bg.base.MatrixState.SetCurrent(ms);
  }
  var ShadowMap = function($__super) {
    function ShadowMap(context) {
      $traceurRuntime.superConstructor(ShadowMap).call(this, context);
      this._pipeline = new bg.base.Pipeline(context);
      this._pipeline.renderSurface = new bg.base.TextureSurface(context);
      this._pipeline.renderSurface.create();
      this._pipeline.effect = new bg.base.ShadowMapEffect(context);
      this._matrixState = new bg.base.MatrixState();
      this._drawVisitor = new bg.scene.DrawVisitor(this._pipeline, this._matrixState);
      this._shadowMapSize = new bg.Vector2(2048);
      this._pipeline.viewport = new bg.Viewport(0, 0, this._shadowMapSize.width, this._shadowMapSize.height);
      this._shadowType = bg.base.ShadowType.SOFT;
      this._projection = bg.Matrix4.Ortho(-15, 15, -15, 15, 1, 50);
      this._viewMatrix = bg.Matrix4.Identity();
      this._shadowColor = bg.Color.Black();
    }
    return ($traceurRuntime.createClass)(ShadowMap, {
      get size() {
        return this._shadowMapSize;
      },
      set size(s) {
        this._shadowMapSize = s;
        this._pipeline.viewport = new bg.Viewport(0, 0, s.width, s.height);
      },
      get shadowType() {
        return this._shadowType;
      },
      set shadowType(t) {
        this._shadowType = t;
      },
      get shadowColor() {
        return this._shadowColor;
      },
      set shadowColor(c) {
        this._shadowColor = c;
      },
      get viewMatrix() {
        return this._viewMatrix;
      },
      get projection() {
        return this._projection;
      },
      get texture() {
        return this._pipeline.renderSurface.getTexture(0);
      },
      update: function(scene, camera, light, lightTransform) {
        var cascade = arguments[4] !== (void 0) ? arguments[4] : bg.base.ShadowCascade.NEAR;
        if (light.type == bg.base.LightType.DIRECTIONAL) {
          updateDirectional.apply(this, [scene, camera, light, lightTransform, cascade]);
        } else if (light.type == bg.base.LightType.SPOT) {
          updateSpot.apply(this, [scene, camera, light, lightTransform]);
        }
      }
    }, {}, $__super);
  }(bg.app.ContextObject);
  bg.base.ShadowMap = ShadowMap;
})();

"use strict";
(function() {
  var s_textureCache = {};
  var COLOR_TEXTURE_SIZE = 8;
  var s_whiteTexture = "static-white-color-texture";
  var s_blackTexture = "static-black-color-texture";
  var s_normalTexture = "static-normal-color-texture";
  var s_randomTexture = "static-random-color-texture";
  var s_whiteCubemap = "static-white-cubemap-texture";
  var TextureCache = function() {
    function TextureCache(context) {
      this._context = context;
      this._textures = {};
    }
    return ($traceurRuntime.createClass)(TextureCache, {
      find: function(url) {
        return this._textures[url];
      },
      register: function(url, texture) {
        if (texture instanceof bg.base.Texture) {
          this._textures[url] = texture;
        }
      },
      unregister: function(url) {
        if (this._textures[url]) {
          delete this._textures[url];
        }
      },
      clear: function() {
        this._textures = {};
      }
    }, {
      SetColorTextureSize: function(size) {
        COLOR_TEXTURE_SIZE = size;
      },
      GetColorTextureSize: function() {
        return COLOR_TEXTURE_SIZE;
      },
      WhiteCubemap: function(context) {
        var cache = TextureCache.Get(context);
        var tex = cache.find(s_whiteCubemap);
        if (!tex) {
          tex = bg.base.Texture.WhiteCubemap(context);
          cache.register(s_whiteCubemap, tex);
        }
        return tex;
      },
      WhiteTexture: function(context) {
        var cache = TextureCache.Get(context);
        var tex = cache.find(s_whiteTexture);
        if (!tex) {
          tex = bg.base.Texture.WhiteTexture(context, new bg.Vector2(COLOR_TEXTURE_SIZE));
          cache.register(s_whiteTexture, tex);
        }
        return tex;
      },
      BlackTexture: function(context) {
        var cache = TextureCache.Get(context);
        var tex = cache.find(s_blackTexture);
        if (!tex) {
          tex = bg.base.Texture.BlackTexture(context, new bg.Vector2(COLOR_TEXTURE_SIZE));
          cache.register(s_blackTexture, tex);
        }
        return tex;
      },
      NormalTexture: function(context) {
        var cache = TextureCache.Get(context);
        var tex = cache.find(s_normalTexture);
        if (!tex) {
          tex = bg.base.Texture.NormalTexture(context, new bg.Vector2(COLOR_TEXTURE_SIZE));
          cache.register(s_normalTexture, tex);
        }
        return tex;
      },
      RandomTexture: function(context) {
        var cache = TextureCache.Get(context);
        var tex = cache.find(s_randomTexture);
        if (!tex) {
          tex = bg.base.Texture.RandomTexture(context, new bg.Vector2(64));
          cache.register(s_randomTexture, tex);
        }
        return tex;
      },
      Get: function(context) {
        if (!s_textureCache[context.uuid]) {
          s_textureCache[context.uuid] = new TextureCache(context);
        }
        return s_textureCache[context.uuid];
      }
    });
  }();
  bg.base.TextureCache = TextureCache;
  var g_wrapX = null;
  var g_wrapY = null;
  var g_minFilter = null;
  var g_magFilter = null;
  var TextureLoaderPlugin = function($__super) {
    function TextureLoaderPlugin() {
      $traceurRuntime.superConstructor(TextureLoaderPlugin).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(TextureLoaderPlugin, {
      acceptType: function(url, data) {
        return bg.utils.Resource.IsImage(url);
      },
      load: function(context, url, data, extraData) {
        return new Promise(function(accept, reject) {
          if (data) {
            var texture = bg.base.TextureCache.Get(context).find(url);
            if (!texture) {
              bg.log(("Texture " + url + " not found. Loading texture"));
              texture = new bg.base.Texture(context);
              texture.create();
              texture.bind();
              texture.wrapX = extraData.wrapX || TextureLoaderPlugin.GetWrapX();
              texture.wrapY = extraData.wrapY || TextureLoaderPlugin.GetWrapY();
              texture.minFilter = extraData.minFilter || TextureLoaderPlugin.GetMinFilter();
              texture.magFilter = extraData.magFilter || TextureLoaderPlugin.GetMagFilter();
              texture.setImage(data);
              texture.fileName = url;
              bg.base.TextureCache.Get(context).register(url, texture);
            }
            accept(texture);
          } else {
            reject(new Error("Error loading texture image data"));
          }
        });
      }
    }, {
      GetWrapX: function() {
        return g_wrapX || bg.base.TextureWrap.REPEAT;
      },
      GetWrapY: function() {
        return g_wrapY || bg.base.TextureWrap.REPEAT;
      },
      GetMinFilter: function() {
        return g_minFilter || bg.base.TextureFilter.LINEAR_MIPMAP_NEAREST;
      },
      GetMagFilter: function() {
        return g_magFilter || bg.base.TextureFilter.LINEAR;
      },
      SetMinFilter: function(f) {
        g_minFilter = f;
      },
      SetMagFilter: function(f) {
        g_magFilter = f;
      },
      SetWrapX: function(w) {
        g_wrapX = w;
      },
      SetWrapY: function(w) {
        g_wrapY = w;
      }
    }, $__super);
  }(bg.base.LoaderPlugin);
  bg.base.TextureLoaderPlugin = TextureLoaderPlugin;
  var VideoTextureLoaderPlugin = function($__super) {
    function VideoTextureLoaderPlugin() {
      $traceurRuntime.superConstructor(VideoTextureLoaderPlugin).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(VideoTextureLoaderPlugin, {
      acceptType: function(url, data) {
        return bg.utils.Resource.IsVideo(url);
      },
      load: function(context, url, video) {
        return new Promise(function(accept, reject) {
          if (video) {
            var texture = new bg.base.Texture(context);
            texture.create();
            texture.bind();
            texture.setVideo(video);
            texture.fileName = url;
            accept(texture);
          } else {
            reject(new Error("Error loading video texture data"));
          }
        });
      }
    }, {}, $__super);
  }(bg.base.LoaderPlugin);
  bg.base.VideoTextureLoaderPlugin = VideoTextureLoaderPlugin;
})();

"use strict";
(function() {
  bg.base.TextureUnit = {
    TEXTURE_0: 0,
    TEXTURE_1: 1,
    TEXTURE_2: 2,
    TEXTURE_3: 3,
    TEXTURE_4: 4,
    TEXTURE_5: 5,
    TEXTURE_6: 6,
    TEXTURE_7: 7,
    TEXTURE_8: 8,
    TEXTURE_9: 9,
    TEXTURE_10: 10,
    TEXTURE_11: 11,
    TEXTURE_12: 12,
    TEXTURE_13: 13,
    TEXTURE_14: 14,
    TEXTURE_15: 15,
    TEXTURE_16: 16,
    TEXTURE_17: 17,
    TEXTURE_18: 18,
    TEXTURE_19: 19,
    TEXTURE_20: 20,
    TEXTURE_21: 21,
    TEXTURE_22: 22,
    TEXTURE_23: 23,
    TEXTURE_24: 24,
    TEXTURE_25: 25,
    TEXTURE_26: 26,
    TEXTURE_27: 27,
    TEXTURE_28: 28,
    TEXTURE_29: 29,
    TEXTURE_30: 30
  };
  bg.base.TextureWrap = {
    REPEAT: null,
    CLAMP: null,
    MIRRORED_REPEAT: null
  };
  bg.base.TextureFilter = {
    NEAREST_MIPMAP_NEAREST: null,
    LINEAR_MIPMAP_NEAREST: null,
    NEAREST_MIPMAP_LINEAR: null,
    LINEAR_MIPMAP_LINEAR: null,
    NEAREST: null,
    LINEAR: null
  };
  bg.base.TextureTarget = {
    TEXTURE_2D: null,
    CUBE_MAP: null,
    POSITIVE_X_FACE: null,
    NEGATIVE_X_FACE: null,
    POSITIVE_Y_FACE: null,
    NEGATIVE_Y_FACE: null,
    POSITIVE_Z_FACE: null,
    NEGATIVE_Z_FACE: null
  };
  var TextureImpl = function() {
    function TextureImpl(context) {
      this.initFlags(context);
    }
    return ($traceurRuntime.createClass)(TextureImpl, {
      initFlags: function(context) {
        console.log("TextureImpl: initFlags() method not implemented");
      },
      create: function(context) {
        console.log("TextureImpl: create() method not implemented");
        return null;
      },
      setActive: function(context, texUnit) {
        console.log("TextureImpl: setActive() method not implemented");
      },
      bind: function(context, target, texture) {
        console.log("TextureImpl: bind() method not implemented");
      },
      unbind: function(context, target) {
        console.log("TextureImpl: unbind() method not implemented");
      },
      setTextureWrapX: function(context, target, texture, wrap) {
        console.log("TextureImpl: setTextureWrapX() method not implemented");
      },
      setTextureWrapY: function(context, target, texture, wrap) {
        console.log("TextureImpl: setTextureWrapY() method not implemented");
      },
      setImage: function(context, target, minFilter, magFilter, texture, img, flipY) {
        console.log("TextureImpl: setImage() method not implemented");
      },
      setImageRaw: function(context, target, minFilter, magFilter, texture, width, height, data) {
        console.log("TextureImpl: setImageRaw() method not implemented");
      },
      setTextureFilter: function(context, target, minFilter, magFilter) {
        console.log("TextureImpl: setTextureFilter() method not implemented");
      },
      setCubemapImage: function(context, face, image) {
        console.log("TextureImpl: setCubemapImage() method not implemented");
      },
      setCubemapRaw: function(context, face, rawImage, w, h) {
        console.log("TextureImpl: setCubemapRaw() method not implemented");
      },
      setVideo: function(context, target, texture, video, flipY) {
        console.log("TextureImpl: setVideo() method not implemented");
      },
      updateVideoData: function(context, target, texture, video) {
        console.log("TextureImpl: updateVideoData() method not implemented");
      },
      destroy: function(context, texture) {
        console.log("TextureImpl: destroy() method not implemented");
      }
    }, {});
  }();
  bg.base.TextureImpl = TextureImpl;
  bg.base.TextureDataType = {
    NONE: 0,
    IMAGE: 1,
    IMAGE_DATA: 2,
    CUBEMAP: 3,
    CUBEMAP_DATA: 4,
    VIDEO: 5
  };
  var g_base64TexturePreventRemove = [];
  var Texture = function($__super) {
    function Texture(context) {
      $traceurRuntime.superConstructor(Texture).call(this, context);
      this._texture = null;
      this._fileName = "";
      this._size = new bg.Vector2(0);
      this._target = bg.base.TextureTarget.TEXTURE_2D;
      this._minFilter = bg.base.TextureFilter.LINEAR;
      this._magFilter = bg.base.TextureFilter.LINEAR;
      this._wrapX = bg.base.TextureWrap.REPEAT;
      this._wrapY = bg.base.TextureWrap.REPEAT;
      this._video = null;
    }
    return ($traceurRuntime.createClass)(Texture, {
      get texture() {
        return this._texture;
      },
      get target() {
        return this._target;
      },
      set target(t) {
        this._target = t;
      },
      get fileName() {
        return this._fileName;
      },
      set fileName(fileName) {
        this._fileName = fileName;
      },
      set minFilter(f) {
        this._minFilter = f;
      },
      set magFilter(f) {
        this._magFilter = f;
      },
      get minFilter() {
        return this._minFilter;
      },
      get magFilter() {
        return this._magFilter;
      },
      set wrapX(w) {
        this._wrapX = w;
      },
      set wrapY(w) {
        this._wrapY = w;
      },
      get wrapX() {
        return this._wrapX;
      },
      get wrapY() {
        return this._wrapY;
      },
      get size() {
        return this._size;
      },
      get image() {
        return this._image;
      },
      get imageData() {
        return this._imageData;
      },
      get cubeMapImages() {
        return this._cubeMapImages;
      },
      get cubeMapData() {
        return this._cubeMapData;
      },
      get video() {
        return this._video;
      },
      get dataType() {
        if (this._image) {
          return bg.base.TextureDataType.IMAGE;
        } else if (this._imageData) {
          return bg.base.TextureDataType.IMAGE_DATA;
        } else if (this._cubeMapImages) {
          return bg.base.TextureDataType.CUBEMAP;
        } else if (this._cubeMapData) {
          return bg.base.TextureDataType.CUBEMAP_DATA;
        } else if (this._video) {
          return bg.base.TextureDataType.VIDEO;
        } else {
          return bg.base.TextureDataType.NONE;
        }
      },
      create: function() {
        if (this._texture !== null) {
          this.destroy();
        }
        this._texture = bg.Engine.Get().texture.create(this.context);
      },
      setActive: function(textureUnit) {
        bg.Engine.Get().texture.setActive(this.context, textureUnit);
      },
      bind: function() {
        bg.Engine.Get().texture.bind(this.context, this._target, this._texture);
      },
      unbind: function() {
        Texture.Unbind(this.context, this._target);
      },
      setImage: function(img, flipY) {
        if (flipY === undefined)
          flipY = true;
        this._size.width = img.width;
        this._size.height = img.height;
        bg.Engine.Get().texture.setTextureWrapX(this.context, this._target, this._texture, this._wrapX);
        bg.Engine.Get().texture.setTextureWrapY(this.context, this._target, this._texture, this._wrapY);
        bg.Engine.Get().texture.setImage(this.context, this._target, this._minFilter, this._magFilter, this._texture, img, flipY);
        this._image = img;
        this._imageData = null;
        this._cubeMapImages = null;
        this._cubeMapData = null;
        this._video = null;
      },
      setImageRaw: function(width, height, data, type, format) {
        if (!type) {
          type = this.context.RGBA;
        }
        if (!format) {
          format = this.context.UNSIGNED_BYTE;
        }
        this._size.width = width;
        this._size.height = height;
        bg.Engine.Get().texture.setTextureWrapX(this.context, this._target, this._texture, this._wrapX);
        bg.Engine.Get().texture.setTextureWrapY(this.context, this._target, this._texture, this._wrapY);
        bg.Engine.Get().texture.setImageRaw(this.context, this._target, this._minFilter, this._magFilter, this._texture, width, height, data, type, format);
        this._image = null;
        this._imageData = data;
        this._cubeMapImages = null;
        this._cubeMapData = null;
        this._video = null;
      },
      setCubemap: function(posX, negX, posY, negY, posZ, negZ) {
        bg.Engine.Get().texture.bind(this.context, this._target, this._texture);
        bg.Engine.Get().texture.setTextureWrapX(this.context, this._target, this._texture, this._wrapX);
        bg.Engine.Get().texture.setTextureWrapX(this.context, this._target, this._texture, this._wrapY);
        bg.Engine.Get().texture.setTextureFilter(this.context, this._target, this._minFilter, this._magFilter);
        bg.Engine.Get().texture.setCubemapImage(this.context, bg.base.TextureTarget.POSITIVE_X_FACE, posX);
        bg.Engine.Get().texture.setCubemapImage(this.context, bg.base.TextureTarget.NEGATIVE_X_FACE, negX);
        bg.Engine.Get().texture.setCubemapImage(this.context, bg.base.TextureTarget.POSITIVE_Y_FACE, posY);
        bg.Engine.Get().texture.setCubemapImage(this.context, bg.base.TextureTarget.NEGATIVE_Y_FACE, negY);
        bg.Engine.Get().texture.setCubemapImage(this.context, bg.base.TextureTarget.POSITIVE_Z_FACE, posZ);
        bg.Engine.Get().texture.setCubemapImage(this.context, bg.base.TextureTarget.NEGATIVE_Z_FACE, negZ);
        this._image = null;
        this._imageData = null;
        this._cubeMapImages = {
          posX: posX,
          negX: negX,
          posY: posY,
          negY: negY,
          posZ: posZ,
          negZ: negZ
        };
        this._cubeMapData = null;
        this._video = null;
      },
      setCubemapRaw: function(w, h, posX, negX, posY, negY, posZ, negZ) {
        bg.Engine.Get().texture.bind(this.context, this._target, this._texture);
        bg.Engine.Get().texture.setTextureWrapX(this.context, this._target, this._texture, this._wrapX);
        bg.Engine.Get().texture.setTextureWrapX(this.context, this._target, this._texture, this._wrapY);
        bg.Engine.Get().texture.setTextureFilter(this.context, this._target, this._minFilter, this._magFilter);
        bg.Engine.Get().texture.setCubemapRaw(this.context, bg.base.TextureTarget.POSITIVE_X_FACE, posX, w, h);
        bg.Engine.Get().texture.setCubemapRaw(this.context, bg.base.TextureTarget.NEGATIVE_X_FACE, negX, w, h);
        bg.Engine.Get().texture.setCubemapRaw(this.context, bg.base.TextureTarget.POSITIVE_Y_FACE, posY, w, h);
        bg.Engine.Get().texture.setCubemapRaw(this.context, bg.base.TextureTarget.NEGATIVE_Y_FACE, negY, w, h);
        bg.Engine.Get().texture.setCubemapRaw(this.context, bg.base.TextureTarget.POSITIVE_Z_FACE, posZ, w, h);
        bg.Engine.Get().texture.setCubemapRaw(this.context, bg.base.TextureTarget.NEGATIVE_Z_FACE, negZ, w, h);
        this._image = null;
        this._imageData = null;
        this._cubeMapImages = null;
        this._cubeMapData = {
          width: w,
          height: h,
          posX: posX,
          negX: negX,
          posY: posY,
          negY: negY,
          posZ: posZ,
          negZ: negZ
        };
        this._video = null;
      },
      setVideo: function(video, flipY) {
        if (flipY === undefined)
          flipY = true;
        this._size.width = video.videoWidth;
        this._size.height = video.videoHeight;
        bg.Engine.Get().texture.setVideo(this.context, this._target, this._texture, video, flipY);
        this._video = video;
        this._image = null;
        this._imageData = null;
        this._cubeMapImages = null;
        this._cubeMapData = null;
      },
      destroy: function() {
        bg.Engine.Get().texture.destroy(this.context, this._texture);
        this._texture = null;
        this._minFilter = null;
        this._magFilter = null;
        this._fileName = "";
      },
      valid: function() {
        return this._texture !== null;
      },
      update: function() {
        bg.Engine.Get().texture.updateVideoData(this.context, this._target, this._texture, this._video);
      }
    }, {
      FromBase64Image: function(context, imgData) {
        var tex = new bg.base.Texture(context);
        tex.img = new Image();
        g_base64TexturePreventRemove.push(tex);
        tex.onload = function(evt, img) {
          tex.create();
          tex.bind();
          tex.minFilter = bg.base.TextureLoaderPlugin.GetMinFilter();
          tex.magFilter = bg.base.TextureLoaderPlugin.GetMagFilter();
          tex.setImage(tex.img);
          tex.unbind();
          var index = g_base64TexturePreventRemove.indexOf(tex);
          if (index != -1) {
            g_base64TexturePreventRemove.splice(index, 1);
          }
          bg.emitImageLoadEvent();
        };
        tex.img.src = imgData;
        return tex;
      },
      ColorTexture: function(context, color, size) {
        var colorTexture = new bg.base.Texture(context);
        colorTexture.create();
        colorTexture.bind();
        var dataSize = size.width * size.height * 4;
        var textureData = [];
        for (var i = 0; i < dataSize; i += 4) {
          textureData[i] = color.r * 255;
          textureData[i + 1] = color.g * 255;
          textureData[i + 2] = color.b * 255;
          textureData[i + 3] = color.a * 255;
        }
        textureData = new Uint8Array(textureData);
        colorTexture.minFilter = bg.base.TextureFilter.NEAREST;
        colorTexture.magFilter = bg.base.TextureFilter.NEAREST;
        colorTexture.setImageRaw(size.width, size.height, textureData);
        colorTexture.unbind();
        return colorTexture;
      },
      WhiteTexture: function(context, size) {
        return Texture.ColorTexture(context, bg.Color.White(), size);
      },
      WhiteCubemap: function(context) {
        return Texture.ColorCubemap(context, bg.Color.White());
      },
      BlackCubemap: function(context) {
        return Texture.ColorCubemap(context, bg.Color.Black());
      },
      ColorCubemap: function(context, color) {
        var cm = new bg.base.Texture(context);
        cm.target = bg.base.TextureTarget.CUBE_MAP;
        cm.create();
        cm.bind();
        var dataSize = 32 * 32 * 4;
        var textureData = [];
        for (var i = 0; i < dataSize; i += 4) {
          textureData[i] = color.r * 255;
          textureData[i + 1] = color.g * 255;
          textureData[i + 2] = color.b * 255;
          textureData[i + 3] = color.a * 255;
        }
        textureData = new Uint8Array(textureData);
        cm.setCubemapRaw(32, 32, textureData, textureData, textureData, textureData, textureData, textureData);
        cm.unbind();
        return cm;
      },
      NormalTexture: function(context, size) {
        return Texture.ColorTexture(context, new bg.Color(0.5, 0.5, 1, 1), size);
      },
      BlackTexture: function(context, size) {
        return Texture.ColorTexture(context, bg.Color.Black(), size);
      },
      RandomTexture: function(context, size) {
        var colorTexture = new bg.base.Texture(context);
        colorTexture.create();
        colorTexture.bind();
        var dataSize = size.width * size.height * 4;
        var textureData = [];
        for (var i = 0; i < dataSize; i += 4) {
          var randVector = new bg.Vector3(bg.Math.random() * 2.0 - 1.0, bg.Math.random() * 2.0 - 1.0, 0);
          randVector.normalize();
          textureData[i] = randVector.x * 255;
          textureData[i + 1] = randVector.y * 255;
          textureData[i + 2] = randVector.z * 255;
          textureData[i + 3] = 1;
        }
        textureData = new Uint8Array(textureData);
        colorTexture.minFilter = bg.base.TextureFilter.NEAREST;
        colorTexture.magFilter = bg.base.TextureFilter.NEAREST;
        colorTexture.setImageRaw(size.width, size.height, textureData);
        colorTexture.unbind();
        return colorTexture;
      },
      SetActive: function(context, textureUnit) {
        bg.Engine.Get().texture.setActive(context, textureUnit);
      },
      Unbind: function(context, target) {
        if (!target) {
          target = bg.base.TextureTarget.TEXTURE_2D;
        }
        bg.Engine.Get().texture.unbind(context, target);
      }
    }, $__super);
  }(bg.app.ContextObject);
  bg.base.Texture = Texture;
})();

"use strict";
(function() {
  bg.Math = {
    seed: 1,
    PI: 3.141592653589793,
    DEG_TO_RAD: 0.01745329251994,
    RAD_TO_DEG: 57.29577951308233,
    PI_2: 1.5707963267948966,
    PI_4: 0.785398163397448,
    PI_8: 0.392699081698724,
    TWO_PI: 6.283185307179586,
    EPSILON: 0.0000001,
    Array: Float32Array,
    FLOAT_MAX: 3.402823e38,
    checkZero: function(v) {
      return v > -this.EPSILON && v < this.EPSILON ? 0 : v;
    },
    equals: function(a, b) {
      return Math.abs(a - b) < this.EPSILON;
    },
    degreesToRadians: function(d) {
      return Math.fround(this.checkZero(d * this.DEG_TO_RAD));
    },
    radiansToDegrees: function(r) {
      return Math.fround(this.checkZero(r * this.RAD_TO_DEG));
    },
    sin: function(val) {
      return Math.fround(this.checkZero(Math.sin(val)));
    },
    cos: function(val) {
      return Math.fround(this.checkZero(Math.cos(val)));
    },
    tan: function(val) {
      return Math.fround(this.checkZero(Math.tan(val)));
    },
    cotan: function(val) {
      return Math.fround(this.checkZero(1.0 / this.tan(val)));
    },
    atan: function(val) {
      return Math.fround(this.checkZero(Math.atan(val)));
    },
    atan2: function(i, j) {
      return Math.fround(this.checkZero(Math.atan2f(i, j)));
    },
    random: function() {
      return Math.random();
    },
    seededRandom: function() {
      var max = 1;
      var min = 0;
      this.seed = (this.seed * 9301 + 49297) % 233280;
      var rnd = this.seed / 233280;
      return min + rnd * (max - min);
    },
    max: function(a, b) {
      return Math.fround(Math.max(a, b));
    },
    min: function(a, b) {
      return Math.fround(Math.min(a, b));
    },
    abs: function(val) {
      return Math.fround(Math.abs(val));
    },
    sqrt: function(val) {
      return Math.fround(Math.sqrt(val));
    },
    lerp: function(from, to, t) {
      return Math.fround((1.0 - t) * from + t * to);
    },
    square: function(n) {
      return Math.fround(n * n);
    }
  };
  var MatrixStrategy = function() {
    function MatrixStrategy(target) {
      this._target = target;
    }
    return ($traceurRuntime.createClass)(MatrixStrategy, {
      get target() {
        return this._target;
      },
      set target(t) {
        this._target = t;
      },
      apply: function() {
        console.log("WARNING: MatrixStrategy::apply() not overloaded by the child class.");
      }
    }, {});
  }();
  bg.MatrixStrategy = MatrixStrategy;
})();

"use strict";
(function() {
  var Matrix3 = function() {
    function Matrix3() {
      var v00 = arguments[0] !== (void 0) ? arguments[0] : 1;
      var v01 = arguments[1] !== (void 0) ? arguments[1] : 0;
      var v02 = arguments[2] !== (void 0) ? arguments[2] : 0;
      var v10 = arguments[3] !== (void 0) ? arguments[3] : 0;
      var v11 = arguments[4] !== (void 0) ? arguments[4] : 1;
      var v12 = arguments[5] !== (void 0) ? arguments[5] : 0;
      var v20 = arguments[6] !== (void 0) ? arguments[6] : 0;
      var v21 = arguments[7] !== (void 0) ? arguments[7] : 0;
      var v22 = arguments[8] !== (void 0) ? arguments[8] : 1;
      this._m = new bg.Math.Array(9);
      if (Array.isArray($traceurRuntime.typeof((v00)))) {
        this._m[0] = v00[0];
        this._m[1] = v00[1];
        this._m[2] = v00[0];
        this._m[3] = v00[3];
        this._m[4] = v00[4];
        this._m[5] = v00[5];
        this._m[6] = v00[6];
        this._m[7] = v00[7];
        this._m[8] = v00[8];
      } else if (typeof(v00) == "number") {
        this._m[0] = v00;
        this._m[1] = v01;
        this._m[2] = v02;
        this._m[3] = v10;
        this._m[4] = v11;
        this._m[5] = v12;
        this._m[6] = v20;
        this._m[7] = v21;
        this._m[8] = v22;
      } else {
        this.assign(v00);
      }
    }
    return ($traceurRuntime.createClass)(Matrix3, {
      get m() {
        return this._m;
      },
      toArray: function() {
        return [this._m[0], this._m[1], this._m[2], this._m[3], this._m[4], this._m[5], this._m[6], this._m[7], this._m[8]];
      },
      get m00() {
        return this._m[0];
      },
      get m01() {
        return this._m[1];
      },
      get m02() {
        return this._m[2];
      },
      get m10() {
        return this._m[3];
      },
      get m11() {
        return this._m[4];
      },
      get m12() {
        return this._m[5];
      },
      get m20() {
        return this._m[6];
      },
      get m21() {
        return this._m[7];
      },
      get m22() {
        return this._m[8];
      },
      set m00(v) {
        this._m[0] = v;
      },
      set m01(v) {
        this._m[1] = v;
      },
      set m02(v) {
        this._m[2] = v;
      },
      set m10(v) {
        this._m[3] = v;
      },
      set m11(v) {
        this._m[4] = v;
      },
      set m12(v) {
        this._m[5] = v;
      },
      set m20(v) {
        this._m[6] = v;
      },
      set m21(v) {
        this._m[7] = v;
      },
      set m22(v) {
        this._m[8] = v;
      },
      zero: function() {
        this._m[0] = this._m[1] = this._m[2] = this._m[3] = this._m[4] = this._m[5] = this._m[6] = this._m[7] = this._m[8] = 0;
        return this;
      },
      identity: function() {
        this._m[0] = 1;
        this._m[1] = 0;
        this._m[2] = 0;
        this._m[3] = 0;
        this._m[4] = 1;
        this._m[5] = 0;
        this._m[6] = 0;
        this._m[7] = 0;
        this._m[8] = 1;
        return this;
      },
      isZero: function() {
        return this._m[0] == 0.0 && this._m[1] == 0.0 && this._m[2] == 0.0 && this._m[3] == 0.0 && this._m[4] == 0.0 && this._m[5] == 0.0 && this._m[6] == 0.0 && this._m[7] == 0.0 && this._m[8] == 0.0;
      },
      isIdentity: function() {
        return this._m[0] == 1.0 && this._m[1] == 0.0 && this._m[2] == 0.0 && this._m[3] == 0.0 && this._m[4] == 1.0 && this._m[5] == 0.0 && this._m[6] == 0.0 && this._m[7] == 0.0 && this._m[8] == 1.0;
      },
      row: function(i) {
        return new bg.Vector3(this._m[i * 3], this._m[i * 3 + 1], this._m[i * 3 + 2]);
      },
      setRow: function(i, row) {
        this._m[i * 3] = row._v[0];
        this._m[i * 3 + 1] = row._v[1];
        this._m[i * 3 + 2] = row._v[2];
        return this;
      },
      setScale: function(x, y, z) {
        var rx = new bg.Vector3(this._m[0], this._m[3], this._m[6]).normalize().scale(x);
        var ry = new bg.Vector3(this._m[1], this._m[4], this._m[7]).normalize().scale(y);
        var rz = new bg.Vector3(this._m[2], this._m[5], this._m[8]).normalize().scale(z);
        this._m[0] = rx.x;
        this._m[3] = rx.y;
        this._m[6] = rx.z;
        this._m[1] = ry.x;
        this._m[4] = ry.y;
        this._m[7] = ry.z;
        this._m[2] = rz.x;
        this._m[5] = rz.y;
        this._m[8] = rz.z;
        return this;
      },
      getScale: function() {
        return new bg.Vector3(new bg.Vector3(this._m[0], this._m[3], this._m[6]).module, new bg.Vector3(this._m[1], this._m[4], this._m[7]).module, new bg.Vector3(this._m[2], this._m[5], this._m[8]).module);
      },
      get length() {
        return this._m.length;
      },
      traspose: function() {
        var r0 = new bg.Vector3(this._m[0], this._m[3], this._m[6]);
        var r1 = new bg.Vector3(this._m[1], this._m[4], this._m[7]);
        var r2 = new bg.Vector3(this._m[2], this._m[5], this._m[8]);
        this.setRow(0, r0);
        this.setRow(1, r1);
        this.setRow(2, r2);
        return this;
      },
      elemAtIndex: function(i) {
        return this._m[i];
      },
      assign: function(a) {
        if (a.length == 9) {
          this._m[0] = a._m[0];
          this._m[1] = a._m[1];
          this._m[2] = a._m[2];
          this._m[3] = a._m[3];
          this._m[4] = a._m[4];
          this._m[5] = a._m[5];
          this._m[6] = a._m[6];
          this._m[7] = a._m[7];
          this._m[8] = a._m[8];
        } else if (a.length == 16) {
          this._m[0] = a._m[0];
          this._m[1] = a._m[1];
          this._m[2] = a._m[2];
          this._m[3] = a._m[4];
          this._m[4] = a._m[5];
          this._m[5] = a._m[6];
          this._m[6] = a._m[8];
          this._m[7] = a._m[9];
          this._m[8] = a._m[10];
        }
        return this;
      },
      equals: function(m) {
        return this._m[0] == m._m[0] && this._m[1] == m._m[1] && this._m[2] == m._m[2] && this._m[3] == m._m[3] && this._m[4] == m._m[4] && this._m[5] == m._m[5] && this._m[6] == m._m[6] && this._m[7] == m._m[7] && this._m[8] == m._m[8];
      },
      notEquals: function(m) {
        return this._m[0] != m._m[0] || this._m[1] != m._m[1] || this._m[2] != m._m[2] && this._m[3] != m._m[3] || this._m[4] != m._m[4] || this._m[5] != m._m[5] && this._m[6] != m._m[6] || this._m[7] != m._m[7] || this._m[8] != m._m[8];
      },
      mult: function(a) {
        if (typeof(a) == "number") {
          this._m[0] *= a;
          this._m[1] *= a;
          this._m[2] *= a;
          this._m[3] *= a;
          this._m[4] *= a;
          this._m[5] *= a;
          this._m[6] *= a;
          this._m[7] *= a;
          this._m[8] *= a;
        } else {
          var rm = this._m;
          var lm = a._m;
          var res = new bg.Math.Array(9);
          res[0] = lm[0] * rm[0] + lm[1] * rm[1] + lm[2] * rm[2];
          res[1] = lm[0] * rm[1] + lm[1] * rm[4] + lm[2] * rm[7];
          res[2] = lm[0] * rm[2] + lm[1] * rm[5] + lm[2] * rm[8];
          res[3] = lm[3] * rm[0] + lm[4] * rm[3] + lm[5] * rm[6];
          res[4] = lm[3] * rm[1] + lm[4] * rm[4] + lm[5] * rm[7];
          res[5] = lm[3] * rm[2] + lm[4] * rm[5] + lm[5] * rm[8];
          res[6] = lm[6] * rm[0] + lm[7] * rm[3] + lm[8] * rm[6];
          res[7] = lm[6] * rm[1] + lm[7] * rm[4] + lm[8] * rm[7];
          res[8] = lm[6] * rm[2] + lm[7] * rm[5] + lm[8] * rm[8];
          this._m = res;
        }
        return this;
      },
      multVector: function(vec) {
        if ($traceurRuntime.typeof((vec)) == 'object' && vec._v && vec._v.length >= 2) {
          vec = vec._v;
        }
        var x = vec[0];
        var y = vec[1];
        var z = 1.0;
        return new bg.Vector3(this._m[0] * x + this._m[3] * y + this._m[6] * z, this._m[1] * x + this._m[4] * y + this._m[7] * z, this._m[2] * x + this._m[5] * y + this._m[8] * z);
      },
      isNan: function() {
        return !Math.isNaN(_m[0]) && !Math.isNaN(_m[1]) && !Math.isNaN(_m[2]) && !Math.isNaN(_m[3]) && !Math.isNaN(_m[4]) && !Math.isNaN(_m[5]) && !Math.isNaN(_m[6]) && !Math.isNaN(_m[7]) && !Math.isNaN(_m[8]);
      },
      toString: function() {
        return "[" + this._m[0] + ", " + this._m[1] + ", " + this._m[2] + "]\n" + " [" + this._m[3] + ", " + this._m[4] + ", " + this._m[5] + "]\n" + " [" + this._m[6] + ", " + this._m[7] + ", " + this._m[8] + "]";
      }
    }, {Identity: function() {
        return new bg.Matrix3(1, 0, 0, 0, 1, 0, 0, 0, 1);
      }});
  }();
  bg.Matrix3 = Matrix3;
  var Matrix4 = function() {
    function Matrix4() {
      var m00 = arguments[0] !== (void 0) ? arguments[0] : 0;
      var m01 = arguments[1] !== (void 0) ? arguments[1] : 0;
      var m02 = arguments[2] !== (void 0) ? arguments[2] : 0;
      var m03 = arguments[3] !== (void 0) ? arguments[3] : 0;
      var m10 = arguments[4] !== (void 0) ? arguments[4] : 0;
      var m11 = arguments[5] !== (void 0) ? arguments[5] : 0;
      var m12 = arguments[6] !== (void 0) ? arguments[6] : 0;
      var m13 = arguments[7] !== (void 0) ? arguments[7] : 0;
      var m20 = arguments[8] !== (void 0) ? arguments[8] : 0;
      var m21 = arguments[9] !== (void 0) ? arguments[9] : 0;
      var m22 = arguments[10] !== (void 0) ? arguments[10] : 0;
      var m23 = arguments[11] !== (void 0) ? arguments[11] : 0;
      var m30 = arguments[12] !== (void 0) ? arguments[12] : 0;
      var m31 = arguments[13] !== (void 0) ? arguments[13] : 0;
      var m32 = arguments[14] !== (void 0) ? arguments[14] : 0;
      var m33 = arguments[15] !== (void 0) ? arguments[15] : 0;
      this._m = new bg.Math.Array(16);
      if (Array.isArray(m00)) {
        this._m[0] = m00[0];
        this._m[1] = m00[1];
        this._m[2] = m00[2];
        this._m[3] = m00[3];
        this._m[4] = m00[4];
        this._m[5] = m00[5];
        this._m[6] = m00[6];
        this._m[7] = m00[7];
        this._m[8] = m00[8];
        this._m[9] = m00[9];
        this._m[10] = m00[10];
        this._m[11] = m00[11];
        this._m[12] = m00[12];
        this._m[13] = m00[13];
        this._m[14] = m00[14];
        this._m[15] = m00[15];
      } else if (typeof(m00) == "number") {
        this._m[0] = m00;
        this._m[1] = m01;
        this._m[2] = m02;
        this._m[3] = m03;
        this._m[4] = m10;
        this._m[5] = m11;
        this._m[6] = m12;
        this._m[7] = m13;
        this._m[8] = m20;
        this._m[9] = m21;
        this._m[10] = m22;
        this._m[11] = m23;
        this._m[12] = m30;
        this._m[13] = m31;
        this._m[14] = m32;
        this._m[15] = m33;
      } else {
        this.assign(m00);
      }
    }
    return ($traceurRuntime.createClass)(Matrix4, {
      get m() {
        return this._m;
      },
      toArray: function() {
        return [this._m[0], this._m[1], this._m[2], this._m[3], this._m[4], this._m[5], this._m[6], this._m[7], this._m[8], this._m[9], this._m[10], this._m[11], this._m[12], this._m[13], this._m[14], this._m[15]];
      },
      get m00() {
        return this._m[0];
      },
      get m01() {
        return this._m[1];
      },
      get m02() {
        return this._m[2];
      },
      get m03() {
        return this._m[3];
      },
      get m10() {
        return this._m[4];
      },
      get m11() {
        return this._m[5];
      },
      get m12() {
        return this._m[6];
      },
      get m13() {
        return this._m[7];
      },
      get m20() {
        return this._m[8];
      },
      get m21() {
        return this._m[9];
      },
      get m22() {
        return this._m[10];
      },
      get m23() {
        return this._m[11];
      },
      get m30() {
        return this._m[12];
      },
      get m31() {
        return this._m[13];
      },
      get m32() {
        return this._m[14];
      },
      get m33() {
        return this._m[15];
      },
      set m00(v) {
        this._m[0] = v;
      },
      set m01(v) {
        this._m[1] = v;
      },
      set m02(v) {
        this._m[2] = v;
      },
      set m03(v) {
        this._m[3] = v;
      },
      set m10(v) {
        this._m[4] = v;
      },
      set m11(v) {
        this._m[5] = v;
      },
      set m12(v) {
        this._m[6] = v;
      },
      set m13(v) {
        this._m[7] = v;
      },
      set m20(v) {
        this._m[8] = v;
      },
      set m21(v) {
        this._m[9] = v;
      },
      set m22(v) {
        this._m[10] = v;
      },
      set m23(v) {
        this._m[11] = v;
      },
      set m30(v) {
        this._m[12] = v;
      },
      set m31(v) {
        this._m[13] = v;
      },
      set m32(v) {
        this._m[14] = v;
      },
      set m33(v) {
        this._m[15] = v;
      },
      zero: function() {
        this._m[0] = 0;
        this._m[1] = 0;
        this._m[2] = 0;
        this._m[3] = 0;
        this._m[4] = 0;
        this._m[5] = 0;
        this._m[6] = 0;
        this._m[7] = 0;
        this._m[8] = 0;
        this._m[9] = 0;
        this._m[10] = 0;
        this._m[11] = 0;
        this._m[12] = 0;
        this._m[13] = 0;
        this._m[14] = 0;
        this._m[15] = 0;
        return this;
      },
      identity: function() {
        this._m[0] = 1;
        this._m[1] = 0;
        this._m[2] = 0;
        this._m[3] = 0;
        this._m[4] = 0;
        this._m[5] = 1;
        this._m[6] = 0;
        this._m[7] = 0;
        this._m[8] = 0;
        this._m[9] = 0;
        this._m[10] = 1;
        this._m[11] = 0;
        this._m[12] = 0;
        this._m[13] = 0;
        this._m[14] = 0;
        this._m[15] = 1;
        return this;
      },
      isZero: function() {
        return this._m[0] == 0 && this._m[1] == 0 && this._m[2] == 0 && this._m[3] == 0 && this._m[4] == 0 && this._m[5] == 0 && this._m[6] == 0 && this._m[7] == 0 && this._m[8] == 0 && this._m[9] == 0 && this._m[10] == 0 && this._m[11] == 0 && this._m[12] == 0 && this._m[13] == 0 && this._m[14] == 0 && this._m[15] == 0;
      },
      isIdentity: function() {
        return this._m[0] == 1 && this._m[1] == 0 && this._m[2] == 0 && this._m[3] == 0 && this._m[4] == 0 && this._m[5] == 1 && this._m[6] == 0 && this._m[7] == 0 && this._m[8] == 0 && this._m[9] == 0 && this._m[10] == 1 && this._m[11] == 0 && this._m[12] == 0 && this._m[13] == 0 && this._m[14] == 0 && this._m[15] == 1;
      },
      row: function(i) {
        return new bg.Vector4(this._m[i * 4], this._m[i * 4 + 1], this._m[i * 4 + 2], this._m[i * 4 + 3]);
      },
      setRow: function(i, row) {
        this._m[i * 4] = row._v[0];
        this._m[i * 4 + 1] = row._v[1];
        this._m[i * 4 + 2] = row._v[2];
        this._m[i * 4 + 3] = row._v[3];
        return this;
      },
      setScale: function(x, y, z) {
        var rx = new bg.Vector3(this._m[0], this._m[4], this._m[8]).normalize().scale(x);
        var ry = new bg.Vector3(this._m[1], this._m[5], this._m[9]).normalize().scale(y);
        var rz = new bg.Vector3(this._m[2], this._m[6], this._m[10]).normalize().scale(z);
        this._m[0] = rx.x;
        this._m[4] = rx.y;
        this._m[8] = rx.z;
        this._m[1] = ry.x;
        this._m[5] = ry.y;
        this._m[9] = ry.z;
        this._m[2] = rz.x;
        this._m[6] = rz.y;
        this._m[10] = rz.z;
        return this;
      },
      getScale: function() {
        return new bg.Vector3(new bg.Vector3(this._m[0], this._m[4], this._m[8]).module, new bg.Vector3(this._m[1], this._m[5], this._m[9]).module, new bg.Vector3(this._m[2], this._m[6], this._m[10]).module);
      },
      setPosition: function(pos, y, z) {
        if (typeof(pos) == "number") {
          this._m[12] = pos;
          this._m[13] = y;
          this._m[14] = z;
        } else {
          this._m[12] = pos.x;
          this._m[13] = pos.y;
          this._m[14] = pos.z;
        }
        return this;
      },
      get rotation() {
        var scale = this.getScale();
        return new bg.Matrix4(this._m[0] / scale.x, this._m[1] / scale.y, this._m[2] / scale.z, 0, this._m[4] / scale.x, this._m[5] / scale.y, this._m[6] / scale.z, 0, this._m[8] / scale.x, this._m[9] / scale.y, this._m[10] / scale.z, 0, 0, 0, 0, 1);
      },
      get position() {
        return new bg.Vector3(this._m[12], this._m[13], this._m[14]);
      },
      get length() {
        return this._m.length;
      },
      getMatrix3: function() {
        return new bg.Matrix3(this._m[0], this._m[1], this._m[2], this._m[4], this._m[5], this._m[6], this._m[8], this._m[9], this._m[10]);
      },
      perspective: function(fovy, aspect, nearPlane, farPlane) {
        this.assign(bg.Matrix4.Perspective(fovy, aspect, nearPlane, farPlane));
        return this;
      },
      frustum: function(left, right, bottom, top, nearPlane, farPlane) {
        this.assign(bg.Matrix4.Frustum(left, right, bottom, top, nearPlane, farPlane));
        return this;
      },
      ortho: function(left, right, bottom, top, nearPlane, farPlane) {
        this.assign(bg.Matrix4.Ortho(left, right, bottom, top, nearPlane, farPlane));
        return this;
      },
      lookAt: function(origin, target, up) {
        this.assign(bg.Matrix4.LookAt(origin, target, up));
        return this;
      },
      translate: function(x, y, z) {
        this.mult(bg.Matrix4.Translation(x, y, z));
        return this;
      },
      rotate: function(alpha, x, y, z) {
        this.mult(bg.Matrix4.Rotation(alpha, x, y, z));
        return this;
      },
      scale: function(x, y, z) {
        this.mult(bg.Matrix4.Scale(x, y, z));
        return this;
      },
      elemAtIndex: function(i) {
        return this._m[i];
      },
      assign: function(a) {
        if (a.length == 9) {
          this._m[0] = a._m[0];
          this._m[1] = a._m[1];
          this._m[2] = a._m[2];
          this._m[3] = 0;
          this._m[4] = a._m[3];
          this._m[5] = a._m[4];
          this._m[6] = a._m[5];
          this._m[7] = 0;
          this._m[8] = a._m[6];
          this._m[9] = a._m[7];
          this._m[10] = a._m[8];
          this._m[11] = 0;
          this._m[12] = 0;
          this._m[13] = 0;
          this._m[14] = 0;
          this._m[15] = 1;
        } else if (a.length == 16) {
          this._m[0] = a._m[0];
          this._m[1] = a._m[1];
          this._m[2] = a._m[2];
          this._m[3] = a._m[3];
          this._m[4] = a._m[4];
          this._m[5] = a._m[5];
          this._m[6] = a._m[6];
          this._m[7] = a._m[7];
          this._m[8] = a._m[8];
          this._m[9] = a._m[9];
          this._m[10] = a._m[10];
          this._m[11] = a._m[11];
          this._m[12] = a._m[12];
          this._m[13] = a._m[13];
          this._m[14] = a._m[14];
          this._m[15] = a._m[15];
        }
        return this;
      },
      equals: function(m) {
        return this._m[0] == m._m[0] && this._m[1] == m._m[1] && this._m[2] == m._m[2] && this._m[3] == m._m[3] && this._m[4] == m._m[4] && this._m[5] == m._m[5] && this._m[6] == m._m[6] && this._m[7] == m._m[7] && this._m[8] == m._m[8] && this._m[9] == m._m[9] && this._m[10] == m._m[10] && this._m[11] == m._m[11] && this._m[12] == m._m[12] && this._m[13] == m._m[13] && this._m[14] == m._m[14] && this._m[15] == m._m[15];
      },
      notEquals: function(m) {
        return this._m[0] != m._m[0] || this._m[1] != m._m[1] || this._m[2] != m._m[2] || this._m[3] != m._m[3] || this._m[4] != m._m[4] || this._m[5] != m._m[5] || this._m[6] != m._m[6] || this._m[7] != m._m[7] || this._m[8] != m._m[8] || this._m[9] != m._m[9] || this._m[10] != m._m[10] || this._m[11] != m._m[11] || this._m[12] != m._m[12] || this._m[13] != m._m[13] || this._m[14] != m._m[14] || this._m[15] != m._m[15];
      },
      mult: function(a) {
        if (typeof(a) == 'number') {
          this._m[0] *= a;
          this._m[1] *= a;
          this._m[2] *= a;
          this._m[3] *= a;
          this._m[4] *= a;
          this._m[5] *= a;
          this._m[6] *= a;
          this._m[7] *= a;
          this._m[8] *= a;
          this._m[9] *= a;
          this._m[10] *= a;
          this._m[11] *= a;
          this._m[12] *= a;
          this._m[13] *= a;
          this._m[14] *= a;
          this._m[15] *= a;
          return this;
        }
        var rm = this._m;
        var lm = a._m;
        var res = new bg.Math.Array(16);
        res[0] = lm[0] * rm[0] + lm[1] * rm[4] + lm[2] * rm[8] + lm[3] * rm[12];
        res[1] = lm[0] * rm[1] + lm[1] * rm[5] + lm[2] * rm[9] + lm[3] * rm[13];
        res[2] = lm[0] * rm[2] + lm[1] * rm[6] + lm[2] * rm[10] + lm[3] * rm[14];
        res[3] = lm[0] * rm[3] + lm[1] * rm[7] + lm[2] * rm[11] + lm[3] * rm[15];
        res[4] = lm[4] * rm[0] + lm[5] * rm[4] + lm[6] * rm[8] + lm[7] * rm[12];
        res[5] = lm[4] * rm[1] + lm[5] * rm[5] + lm[6] * rm[9] + lm[7] * rm[13];
        res[6] = lm[4] * rm[2] + lm[5] * rm[6] + lm[6] * rm[10] + lm[7] * rm[14];
        res[7] = lm[4] * rm[3] + lm[5] * rm[7] + lm[6] * rm[11] + lm[7] * rm[15];
        res[8] = lm[8] * rm[0] + lm[9] * rm[4] + lm[10] * rm[8] + lm[11] * rm[12];
        res[9] = lm[8] * rm[1] + lm[9] * rm[5] + lm[10] * rm[9] + lm[11] * rm[13];
        res[10] = lm[8] * rm[2] + lm[9] * rm[6] + lm[10] * rm[10] + lm[11] * rm[14];
        res[11] = lm[8] * rm[3] + lm[9] * rm[7] + lm[10] * rm[11] + lm[11] * rm[15];
        res[12] = lm[12] * rm[0] + lm[13] * rm[4] + lm[14] * rm[8] + lm[15] * rm[12];
        res[13] = lm[12] * rm[1] + lm[13] * rm[5] + lm[14] * rm[9] + lm[15] * rm[13];
        res[14] = lm[12] * rm[2] + lm[13] * rm[6] + lm[14] * rm[10] + lm[15] * rm[14];
        res[15] = lm[12] * rm[3] + lm[13] * rm[7] + lm[14] * rm[11] + lm[15] * rm[15];
        this._m = res;
        return this;
      },
      multVector: function(vec) {
        if ($traceurRuntime.typeof((vec)) == 'object' && vec._v && vec._v.length >= 3) {
          vec = vec._v;
        }
        var x = vec[0];
        var y = vec[1];
        var z = vec[2];
        var w = 1.0;
        return new bg.Vector4(this._m[0] * x + this._m[4] * y + this._m[8] * z + this._m[12] * w, this._m[1] * x + this._m[5] * y + this._m[9] * z + this._m[13] * w, this._m[2] * x + this._m[6] * y + this._m[10] * z + this._m[14] * w, this._m[3] * x + this._m[7] * y + this._m[11] * z + this._m[15] * w);
      },
      invert: function() {
        var a00 = this._m[0],
            a01 = this._m[1],
            a02 = this._m[2],
            a03 = this._m[3],
            a10 = this._m[4],
            a11 = this._m[5],
            a12 = this._m[6],
            a13 = this._m[7],
            a20 = this._m[8],
            a21 = this._m[9],
            a22 = this._m[10],
            a23 = this._m[11],
            a30 = this._m[12],
            a31 = this._m[13],
            a32 = this._m[14],
            a33 = this._m[15];
        var b00 = a00 * a11 - a01 * a10,
            b01 = a00 * a12 - a02 * a10,
            b02 = a00 * a13 - a03 * a10,
            b03 = a01 * a12 - a02 * a11,
            b04 = a01 * a13 - a03 * a11,
            b05 = a02 * a13 - a03 * a12,
            b06 = a20 * a31 - a21 * a30,
            b07 = a20 * a32 - a22 * a30,
            b08 = a20 * a33 - a23 * a30,
            b09 = a21 * a32 - a22 * a31,
            b10 = a21 * a33 - a23 * a31,
            b11 = a22 * a33 - a23 * a32;
        var det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
        if (!det) {
          this.zero();
          return this;
        } else {
          det = 1.0 / det;
          this._m[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
          this._m[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
          this._m[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
          this._m[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
          this._m[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
          this._m[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
          this._m[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
          this._m[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
          this._m[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
          this._m[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
          this._m[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
          this._m[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
          this._m[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
          this._m[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
          this._m[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
          this._m[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
          return this;
        }
      },
      traspose: function() {
        var r0 = new bg.Vector4(this._m[0], this._m[4], this._m[8], this._m[12]);
        var r1 = new bg.Vector4(this._m[1], this._m[5], this._m[9], this._m[13]);
        var r2 = new bg.Vector4(this._m[2], this._m[6], this._m[10], this._m[14]);
        var r3 = new bg.Vector4(this._m[3], this._m[7], this._m[11], this._m[15]);
        this.setRow(0, r0);
        this.setRow(1, r1);
        this.setRow(2, r2);
        this.setRow(3, r3);
        return this;
      },
      transformDirection: function(dir) {
        var direction = new bg.Vector3(dir);
        var trx = new bg.Matrix4(this);
        trx.setRow(3, new bg.Vector4(0.0, 0.0, 0.0, 1.0));
        direction.assign(trx.multVector(direction).xyz);
        direction.normalize();
        return direction;
      },
      get forwardVector() {
        return this.transformDirection(new bg.Vector3(0.0, 0.0, 1.0));
      },
      get rightVector() {
        return this.transformDirection(new bg.Vector3(1.0, 0.0, 0.0));
      },
      get upVector() {
        return this.transformDirection(new bg.Vector3(0.0, 1.0, 0.0));
      },
      get backwardVector() {
        return this.transformDirection(new bg.Vector3(0.0, 0.0, -1.0));
      },
      get leftVector() {
        return this.transformDirection(new bg.Vector3(-1.0, 0.0, 0.0));
      },
      get downVector() {
        return this.transformDirection(new bg.Vector3(0.0, -1.0, 0.0));
      },
      isNan: function() {
        return Number.isNaN(this._m[0]) || Number.isNaN(this._m[1]) || Number.isNaN(this._m[2]) || Number.isNaN(this._m[3]) || Number.isNaN(this._m[4]) || Number.isNaN(this._m[5]) || Number.isNaN(this._m[6]) || Number.isNaN(this._m[7]) || Number.isNaN(this._m[8]) || Number.isNaN(this._m[9]) || Number.isNaN(this._m[10]) || Number.isNaN(this._m[11]) || Number.isNaN(this._m[12]) || Number.isNaN(this._m[13]) || Number.isNaN(this._m[14]) || Number.isNaN(this._m[15]);
      },
      getOrthoValues: function() {
        return [(1 + get23()) / get22(), -(1 - get23()) / get22(), (1 - get13()) / get11(), -(1 + get13()) / get11(), -(1 + get03()) / get00(), (1 - get03()) / get00()];
      },
      getPerspectiveValues: function() {
        return [get23() / (get22() - 1), get23() / (get22() + 1), near * (get12() - 1) / get11(), near * (get12() + 1) / get11(), near * (get02() - 1) / get00(), near * (get02() + 1) / get00()];
      },
      toString: function() {
        return "[" + this._m[0] + ", " + this._m[1] + ", " + this._m[2] + ", " + this._m[3] + "]\n" + " [" + this._m[4] + ", " + this._m[5] + ", " + this._m[6] + ", " + this._m[7] + "]\n" + " [" + this._m[8] + ", " + this._m[9] + ", " + this._m[10] + ", " + this._m[11] + "]\n" + " [" + this._m[12] + ", " + this._m[13] + ", " + this._m[14] + ", " + this._m[15] + "]";
      }
    }, {
      Unproject: function(x, y, depth, mvMat, pMat, viewport) {
        var mvp = new bg.Matrix4(pMat);
        mvp.mult(mvMat);
        mvp.invert();
        var vin = new bg.Vector4(((x - viewport.y) / viewport.width) * 2.0 - 1.0, ((y - viewport.x) / viewport.height) * 2.0 - 1.0, depth * 2.0 - 1.0, 1.0);
        var result = new bg.Vector4(mvp.multVector(vin));
        if (result.z == 0) {
          result.set(0);
        } else {
          result.set(result.x / result.w, result.y / result.w, result.z / result.w, result.w / result.w);
        }
        return result;
      },
      Identity: function() {
        return new bg.Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
      },
      Perspective: function(fovy, aspect, nearPlane, farPlane) {
        var fovy2 = bg.Math.tan(fovy * bg.Math.PI / 360.0) * nearPlane;
        var fovy2aspect = fovy2 * aspect;
        return bg.Matrix4.Frustum(-fovy2aspect, fovy2aspect, -fovy2, fovy2, nearPlane, farPlane);
      },
      Frustum: function(left, right, bottom, top, nearPlane, farPlane) {
        var res = new bg.Matrix4();
        var A = right - left;
        var B = top - bottom;
        var C = farPlane - nearPlane;
        res.setRow(0, new bg.Vector4(nearPlane * 2.0 / A, 0.0, 0.0, 0.0));
        res.setRow(1, new bg.Vector4(0.0, nearPlane * 2.0 / B, 0.0, 0.0));
        res.setRow(2, new bg.Vector4((right + left) / A, (top + bottom) / B, -(farPlane + nearPlane) / C, -1.0));
        res.setRow(3, new bg.Vector4(0.0, 0.0, -(farPlane * nearPlane * 2.0) / C, 0.0));
        return res;
      },
      Ortho: function(left, right, bottom, top, nearPlane, farPlane) {
        var p = new bg.Matrix4();
        var m = right - left;
        var l = top - bottom;
        var k = farPlane - nearPlane;
        ;
        p._m[0] = 2 / m;
        p._m[1] = 0;
        p._m[2] = 0;
        p._m[3] = 0;
        p._m[4] = 0;
        p._m[5] = 2 / l;
        p._m[6] = 0;
        p._m[7] = 0;
        p._m[8] = 0;
        p._m[9] = 0;
        p._m[10] = -2 / k;
        p._m[11] = 0;
        p._m[12] = -(left + right) / m;
        p._m[13] = -(top + bottom) / l;
        p._m[14] = -(farPlane + nearPlane) / k;
        p._m[15] = 1;
        return p;
      },
      LookAt: function(p_eye, p_center, p_up) {
        var result = new bg.Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        var forward = new bg.Vector3(p_center);
        forward.sub(p_eye);
        var up = new bg.Vector3(p_up);
        forward.normalize();
        var side = new bg.Vector3(forward);
        side.cross(up);
        up.assign(side);
        up.cross(forward);
        result.set00(side.x);
        result.set10(side.y);
        result.set20(side.z);
        result.set01(up.x);
        result.set11(up.y);
        result.set21(up.z);
        result.set02(-forward.x);
        result.set12(-forward.y);
        result.set22(-forward.z);
        result.setRow(3, new vwgl.Vector4(-p_eye.x, -p_eye.y, -p_eye.z, 1.0));
        return result;
      },
      Translation: function(x, y, z) {
        if ($traceurRuntime.typeof((x)) == 'object' && x._v && x._v.length >= 3) {
          y = x._v[1];
          z = x._v[2];
          x = x._v[0];
        }
        return new bg.Matrix4(1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 0.0, 1.0, 0.0, x, y, z, 1.0);
      },
      Rotation: function(alpha, x, y, z) {
        var axis = new bg.Vector3(x, y, z);
        axis.normalize();
        var rot = new bg.Matrix4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        var cosAlpha = bg.Math.cos(alpha);
        var acosAlpha = 1.0 - cosAlpha;
        var sinAlpha = bg.Math.sin(alpha);
        return new bg.Matrix4(axis.x * axis.x * acosAlpha + cosAlpha, axis.x * axis.y * acosAlpha + axis.z * sinAlpha, axis.x * axis.z * acosAlpha - axis.y * sinAlpha, 0, axis.y * axis.x * acosAlpha - axis.z * sinAlpha, axis.y * axis.y * acosAlpha + cosAlpha, axis.y * axis.z * acosAlpha + axis.x * sinAlpha, 0, axis.z * axis.x * acosAlpha + axis.y * sinAlpha, axis.z * axis.y * acosAlpha - axis.x * sinAlpha, axis.z * axis.z * acosAlpha + cosAlpha, 0, 0, 0, 0, 1);
      },
      Scale: function(x, y, z) {
        if ($traceurRuntime.typeof((x)) == 'object' && x._v && x._v.length >= 3) {
          x = x._v[0];
          y = x._v[1];
          z = x._v[2];
        }
        return new bg.Matrix4(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);
      }
    });
  }();
  bg.Matrix4 = Matrix4;
})();

"use strict";
(function() {
  var Vector = function() {
    function Vector(v) {
      this._v = v;
    }
    return ($traceurRuntime.createClass)(Vector, {
      get v() {
        return this._v;
      },
      get length() {
        return this._v.length;
      },
      get x() {
        return this._v[0];
      },
      set x(v) {
        this._v[0] = v;
      },
      get y() {
        return this._v[1];
      },
      set y(v) {
        this._v[1] = v;
      },
      get module() {
        return this.magnitude();
      },
      toArray: function() {
        var result = [];
        for (var i = 0; i < this.v.length; ++i) {
          result.push(this.v[i]);
        }
        return result;
      }
    }, {
      MinComponents: function(v1, v2) {
        var length = Math.min(v1.length, v2.length);
        var result = null;
        switch (length) {
          case 2:
            result = new bg.Vector2();
            break;
          case 3:
            result = new bg.Vector3();
            break;
          case 4:
            result = new bg.Vector4();
            break;
        }
        for (var i = 0; i < length; ++i) {
          result._v[i] = v1._v[i] < v2._v[i] ? v1._v[i] : v2._v[i];
        }
        return result;
      },
      MaxComponents: function(v1, v2) {
        var length = Math.min(v1.length, v2.length);
        var result = null;
        switch (length) {
          case 2:
            result = new bg.Vector2();
            break;
          case 3:
            result = new bg.Vector3();
            break;
          case 4:
            result = new bg.Vector4();
            break;
        }
        for (var i = 0; i < length; ++i) {
          result._v[i] = v1._v[i] > v2._v[i] ? v1._v[i] : v2._v[i];
        }
        return result;
      }
    });
  }();
  bg.VectorBase = Vector;
  bg.Vector = Vector;
  var Vector2 = function($__super) {
    function Vector2() {
      var x = arguments[0] !== (void 0) ? arguments[0] : 0;
      var y = arguments[1];
      $traceurRuntime.superConstructor(Vector2).call(this, new bg.Math.Array(2));
      if (x instanceof Vector2) {
        this._v[0] = x._v[0];
        this._v[1] = x._v[1];
      } else if (Array.isArray(x) && x.length >= 2) {
        this._v[0] = x[0];
        this._v[1] = x[1];
      } else {
        if (y === undefined)
          y = x;
        this._v[0] = x;
        this._v[1] = y;
      }
    }
    return ($traceurRuntime.createClass)(Vector2, {
      distance: function(other) {
        var v3 = new bg.Vector2(this._v[0] - other._v[0], this._v[1] - other._v[1]);
        return v3.magnitude();
      },
      normalize: function() {
        var m = this.magnitude();
        this._v[0] = this._v[0] / m;
        this._v[1] = this._v[1] / m;
        return this;
      },
      add: function(v2) {
        this._v[0] += v2._v[0];
        this._v[1] += v2._v[1];
        return this;
      },
      sub: function(v2) {
        this._v[0] -= v2._v[0];
        this._v[1] -= v2._v[1];
        return this;
      },
      dot: function(v2) {
        return this._v[0] * v2._v[0] + this._v[1] * v2._v[1];
      },
      scale: function(scale) {
        this._v[0] *= scale;
        this._v[1] *= scale;
        return this;
      },
      magnitude: function() {
        return Math.sqrt(this._v[0] * this._v[0] + this._v[1] * this._v[1]);
      },
      elemAtIndex: function(i) {
        return this._v[i];
      },
      equals: function(v) {
        return this._v[0] == v._v[0] && this._v[1] == v._v[1];
      },
      notEquals: function(v) {
        return this._v[0] != v._v[0] || this._v[1] != v._v[1];
      },
      assign: function(v) {
        this._v[0] = v._v[0];
        this._v[1] = v._v[1];
      },
      set: function(x, y) {
        if (y === undefined)
          y = x;
        this._v[0] = x;
        this._v[1] = y;
      },
      get width() {
        return this._v[0];
      },
      get height() {
        return this._v[1];
      },
      set width(v) {
        this._v[0] = v;
      },
      set height(v) {
        this._v[1] = v;
      },
      get aspectRatio() {
        return this._v[0] / this._v[1];
      },
      isNan: function() {
        return isNaN(this._v[0]) || isNaN(this._v[1]);
      },
      toString: function() {
        return "[" + this._v + "]";
      }
    }, {
      Add: function(v1, v2) {
        return new Vector2(v1.x + v2.x, v1.y + v2.y);
      },
      Sub: function(v1, v2) {
        return new Vector2(v1.x - v2.x, v1.y - v2.y);
      }
    }, $__super);
  }(Vector);
  bg.Vector2 = Vector2;
  var Vector3 = function($__super) {
    function Vector3() {
      var x = arguments[0] !== (void 0) ? arguments[0] : 0;
      var y = arguments[1] !== (void 0) ? arguments[1] : 0;
      var z = arguments[2] !== (void 0) ? arguments[2] : 0;
      $traceurRuntime.superConstructor(Vector3).call(this, new bg.Math.Array(3));
      if (x instanceof Vector2) {
        this._v[0] = x._v[0];
        this._v[1] = x._v[1];
        this._v[2] = y;
      } else if (x instanceof Vector3) {
        this._v[0] = x._v[0];
        this._v[1] = x._v[1];
        this._v[2] = x._v[2];
      } else if (Array.isArray(x) && x.length >= 3) {
        this._v[0] = x[0];
        this._v[1] = x[1];
        this._v[2] = x[2];
      } else {
        if (y === undefined)
          y = x;
        if (z === undefined)
          z = y;
        this._v[0] = x;
        this._v[1] = y;
        this._v[2] = z;
      }
    }
    return ($traceurRuntime.createClass)(Vector3, {
      get z() {
        return this._v[2];
      },
      set z(v) {
        this._v[2] = v;
      },
      magnitude: function() {
        return Math.sqrt(this._v[0] * this._v[0] + this._v[1] * this._v[1] + this._v[2] * this._v[2]);
      },
      normalize: function() {
        var m = this.magnitude();
        this._v[0] = this._v[0] / m;
        this._v[1] = this._v[1] / m;
        this._v[2] = this._v[2] / m;
        return this;
      },
      distance: function(other) {
        var v3 = new bg.Vector3(this._v[0] - other._v[0], this._v[1] - other._v[1], this._v[2] - other._v[2]);
        return v3.magnitude();
      },
      add: function(v2) {
        this._v[0] += v2._v[0];
        this._v[1] += v2._v[1];
        this._v[2] += v2._v[2];
        return this;
      },
      sub: function(v2) {
        this._v[0] -= v2._v[0];
        this._v[1] -= v2._v[1];
        this._v[2] -= v2._v[2];
        return this;
      },
      dot: function(v2) {
        return this._v[0] * v2._v[0] + this._v[1] * v2._v[1] + this._v[2] * v2._v[2];
      },
      scale: function(scale) {
        this._v[0] *= scale;
        this._v[1] *= scale;
        this._v[2] *= scale;
        return this;
      },
      cross: function(v2) {
        var x = this._v[1] * v2._v[2] - this._v[2] * v2._v[1];
        var y = this._v[2] * v2._v[0] - this._v[0] * v2._v[2];
        var z = this._v[0] * v2._v[1] - this._v[1] * v2._v[0];
        this._v[0] = x;
        this._v[1] = y;
        this._v[2] = z;
        return this;
      },
      elemAtIndex: function(i) {
        return this._v[i];
      },
      equals: function(v) {
        return this._v[0] == v._v[0] && this._v[1] == v._v[1] && this._v[2] == v._v[2];
      },
      notEquals: function(v) {
        return this._v[0] != v._v[0] || this._v[1] != v._v[1] || this._v[2] != v._v[2];
      },
      assign: function(v) {
        this._v[0] = v._v[0];
        this._v[1] = v._v[1];
        if (v._v.length >= 3)
          this._v[2] = v._v[2];
      },
      set: function(x, y, z) {
        this._v[0] = x;
        this._v[1] = (y === undefined) ? x : y;
        this._v[2] = (y === undefined) ? x : (z === undefined ? y : z);
      },
      get width() {
        return this._v[0];
      },
      get height() {
        return this._v[1];
      },
      get depth() {
        return this._v[2];
      },
      set width(v) {
        this._v[0] = v;
      },
      set height(v) {
        this._v[1] = v;
      },
      set depth(v) {
        this._v[2] = v;
      },
      get xy() {
        return new bg.Vector2(this._v[0], this._v[1]);
      },
      get yz() {
        return new bg.Vector2(this._v[1], this._v[2]);
      },
      get xz() {
        return new bg.Vector2(this._v[0], this._v[2]);
      },
      isNan: function() {
        return isNaN(this._v[0]) || isNaN(this._v[1]) || isNaN(this._v[2]);
      },
      toString: function() {
        return "[" + this._v + "]";
      }
    }, {
      Add: function(v1, v2) {
        return new Vector3(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
      },
      Sub: function(v1, v2) {
        return new Vector3(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
      }
    }, $__super);
  }(Vector);
  bg.Vector3 = Vector3;
  var Vector4 = function($__super) {
    function Vector4() {
      var x = arguments[0] !== (void 0) ? arguments[0] : 0;
      var y = arguments[1] !== (void 0) ? arguments[1] : 0;
      var z = arguments[2] !== (void 0) ? arguments[2] : 0;
      var w = arguments[3] !== (void 0) ? arguments[3] : 0;
      $traceurRuntime.superConstructor(Vector4).call(this, new bg.Math.Array(4));
      if (x instanceof Vector2) {
        this._v[0] = x._v[0];
        this._v[1] = x._v[1];
        this._v[2] = y;
        this._v[3] = z;
      } else if (x instanceof Vector3) {
        this._v[0] = x._v[0];
        this._v[1] = x._v[1];
        this._v[2] = x._v[2];
        this._v[3] = y;
      } else if (x instanceof Vector4) {
        this._v[0] = x._v[0];
        this._v[1] = x._v[1];
        this._v[2] = x._v[2];
        this._v[3] = x._v[3];
      } else if (Array.isArray(x) && x.length >= 4) {
        this._v[0] = x[0];
        this._v[1] = x[1];
        this._v[2] = x[2];
        this._v[3] = x[3];
      } else {
        if (y === undefined)
          y = x;
        if (z === undefined)
          z = y;
        if (w === undefined)
          w = z;
        this._v[0] = x;
        this._v[1] = y;
        this._v[2] = z;
        this._v[3] = w;
      }
    }
    return ($traceurRuntime.createClass)(Vector4, {
      get z() {
        return this._v[2];
      },
      set z(v) {
        this._v[2] = v;
      },
      get w() {
        return this._v[3];
      },
      set w(v) {
        this._v[3] = v;
      },
      magnitude: function() {
        return Math.sqrt(this._v[0] * this._v[0] + this._v[1] * this._v[1] + this._v[2] * this._v[2] + this._v[3] * this._v[3]);
      },
      normalize: function() {
        var m = this.magnitude();
        this._v[0] = this._v[0] / m;
        this._v[1] = this._v[1] / m;
        this._v[2] = this._v[2] / m;
        this._v[3] = this._v[3] / m;
        return this;
      },
      distance: function(other) {
        var v3 = new bg.Vector4(this._v[0] - other._v[0], this._v[1] - other._v[1], this._v[2] - other._v[2], this._v[3] - other._v[3]);
        return v3.magnitude();
      },
      add: function(v2) {
        this._v[0] += v2._v[0];
        this._v[1] += v2._v[1];
        this._v[2] += v2._v[2];
        this._v[3] += v2._v[3];
        return this;
      },
      sub: function(v2) {
        this._v[0] -= v2._v[0];
        this._v[1] -= v2._v[1];
        this._v[2] -= v2._v[2];
        this._v[3] -= v2._v[3];
        return this;
      },
      dot: function(v2) {
        return this._v[0] * v2._v[0] + this._v[1] * v2._v[1] + this._v[2] * v2._v[2] + this._v[3] * v2._v[3];
      },
      scale: function(scale) {
        this._v[0] *= scale;
        this._v[1] *= scale;
        this._v[2] *= scale;
        this._v[3] *= scale;
        return this;
      },
      elemAtIndex: function(i) {
        return this._v[i];
      },
      equals: function(v) {
        return this._v[0] == v._v[0] && this._v[1] == v._v[1] && this._v[2] == v._v[2] && this._v[3] == v._v[3];
      },
      notEquals: function(v) {
        return this._v[0] != v._v[0] || this._v[1] != v._v[1] || this._v[2] != v._v[2] || this._v[3] != v._v[3];
      },
      assign: function(v) {
        this._v[0] = v._v[0];
        this._v[1] = v._v[1];
        if (v._v.length >= 3)
          this._v[2] = v._v[2];
        if (v._v.length == 4)
          this._v[3] = v._v[3];
      },
      set: function(x, y, z, w) {
        this._v[0] = x;
        this._v[1] = (y === undefined) ? x : y;
        this._v[2] = (y === undefined) ? x : (z === undefined ? y : z);
        this._v[3] = (y === undefined) ? x : (z === undefined ? y : (w === undefined ? z : w));
      },
      get r() {
        return this._v[0];
      },
      get g() {
        return this._v[1];
      },
      get b() {
        return this._v[2];
      },
      get a() {
        return this._v[3];
      },
      set r(v) {
        this._v[0] = v;
      },
      set g(v) {
        this._v[1] = v;
      },
      set b(v) {
        this._v[2] = v;
      },
      set a(v) {
        this._v[3] = v;
      },
      get xy() {
        return new bg.Vector2(this._v[0], this._v[1]);
      },
      get yz() {
        return new bg.Vector2(this._v[1], this._v[2]);
      },
      get xz() {
        return new bg.Vector2(this._v[0], this._v[2]);
      },
      get xyz() {
        return new bg.Vector3(this._v[0], this._v[1], this._v[2]);
      },
      get width() {
        return this._v[2];
      },
      get height() {
        return this._v[3];
      },
      set width(v) {
        this._v[2] = v;
      },
      set height(v) {
        this._v[3] = v;
      },
      get aspectRatio() {
        return this._v[3] != 0 ? this._v[2] / this._v[3] : 1.0;
      },
      isNan: function() {
        return isNaN(this._v[0]) || isNaN(this._v[1]) || isNaN(this._v[2]) || isNaN(this._v[3]);
      },
      toString: function() {
        return "[" + this._v + "]";
      }
    }, {
      Add: function(v1, v2) {
        return new Vector4(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z, v1.w + v2.w);
      },
      Sub: function(v1, v2) {
        return new Vector4(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z, v1.w - v2.w);
      },
      Yellow: function() {
        return new bg.Vector4(1.0, 1.0, 0.0, 1.0);
      },
      Orange: function() {
        return new bg.Vector4(1.0, 0.5, 0.0, 1.0);
      },
      Red: function() {
        return new bg.Vector4(1.0, 0.0, 0.0, 1.0);
      },
      Violet: function() {
        return new bg.Vector4(0.5, 0.0, 1.0, 1.0);
      },
      Blue: function() {
        return new bg.Vector4(0.0, 0.0, 1.0, 1.0);
      },
      Green: function() {
        return new bg.Vector4(0.0, 1.0, 0.0, 1.0);
      },
      White: function() {
        return new bg.Vector4(1.0, 1.0, 1.0, 1.0);
      },
      LightGray: function() {
        return new bg.Vector4(0.8, 0.8, 0.8, 1.0);
      },
      Gray: function() {
        return new bg.Vector4(0.5, 0.5, 0.5, 1.0);
      },
      DarkGray: function() {
        return new bg.Vector4(0.2, 0.2, 0.2, 1.0);
      },
      Black: function() {
        return new bg.Vector4(0.0, 0.0, 0.0, 1.0);
      },
      Brown: function() {
        return new bg.Vector4(0.4, 0.2, 0.0, 1.0);
      },
      Transparent: function() {
        return new bg.Vector4(0, 0, 0, 0);
      }
    }, $__super);
  }(Vector);
  bg.Vector4 = Vector4;
  bg.Size2D = Vector2;
  bg.Size3D = Vector3;
  bg.Position2D = Vector2;
  bg.Viewport = Vector4;
  bg.Color = Vector4;
  var Bounds = function($__super) {
    function Bounds() {
      var a = arguments[0] !== (void 0) ? arguments[0] : 0;
      var b = arguments[1] !== (void 0) ? arguments[1] : 0;
      var c = arguments[2] !== (void 0) ? arguments[2] : 0;
      var d = arguments[3] !== (void 0) ? arguments[3] : 0;
      var e = arguments[4] !== (void 0) ? arguments[4] : 0;
      var f = arguments[5] !== (void 0) ? arguments[5] : 0;
      $traceurRuntime.superConstructor(Bounds).call(this, new bg.Math.Array(6));
      this._v[0] = a;
      this._v[1] = b;
      this._v[2] = c;
      this._v[3] = d;
      this._v[4] = e;
      this._v[5] = f;
    }
    return ($traceurRuntime.createClass)(Bounds, {
      elemAtIndex: function(i) {
        return this._v[i];
      },
      equals: function(v) {
        return this._v[0] == v._v[0] && this._v[1] == v._v[1] && this._v[2] == v._v[2] && this._v[3] == v._v[3] && this._v[4] == v._v[4] && this._v[5] == v._v[5];
      },
      notEquals: function(v) {
        return this._v[0] != v._v[0] || this._v[1] != v._v[1] || this._v[2] != v._v[2] || this._v[3] != v._v[3] || this._v[4] != v._v[4] || this._v[5] != v._v[5];
      },
      assign: function(v) {
        this._v[0] = v._v[0];
        this._v[1] = v._v[1];
        this._v[2] = v._v[2];
        this._v[3] = v._v[3];
        this._v[4] = v._v[4];
        this._v[5] = v._v[5];
      },
      set: function(left, right, bottom, top, back, front) {
        this._v[0] = left;
        this._v[1] = (right === undefined) ? left : right;
        this._v[2] = (right === undefined) ? left : bottom;
        this._v[3] = (right === undefined) ? left : top;
        this._v[4] = (right === undefined) ? left : back;
        this._v[5] = (right === undefined) ? left : front;
      },
      get left() {
        return this._v[0];
      },
      get right() {
        return this._v[1];
      },
      get bottom() {
        return this._v[2];
      },
      get top() {
        return this._v[3];
      },
      get back() {
        return this._v[4];
      },
      get front() {
        return this._v[5];
      },
      set left(v) {
        this._v[0] = v;
      },
      set right(v) {
        this._v[1] = v;
      },
      set bottom(v) {
        this._v[2] = v;
      },
      set top(v) {
        this._v[3] = v;
      },
      set back(v) {
        this._v[4] = v;
      },
      set front(v) {
        this._v[5] = v;
      },
      get width() {
        return Math.abs(this._v[1] - this._v[0]);
      },
      get height() {
        return Math.abs(this._v[3] - this._v[2]);
      },
      get depth() {
        return Math.abs(this._v[5] - this._v[4]);
      },
      isNan: function() {
        return isNaN(this._v[0]) || isNaN(this._v[1]) || isNaN(this._v[2]) || isNaN(this._v[3]) || isNaN(this._v[4]) || isNaN(this._v[5]);
      },
      toString: function() {
        return "[" + this._v + "]";
      },
      isInBounds: function(v) {
        return v.x >= this._v[0] && v.x <= this._v[1] && v.y >= this._v[2] && v.y <= this._v[3] && v.z >= this._v[4] && v.z <= this._v[5];
      }
    }, {}, $__super);
  }(Vector);
  bg.Bounds = Bounds;
  var Quaternion = function($__super) {
    function Quaternion(a, b, c, d) {
      $traceurRuntime.superConstructor(Quaternion).call(this);
      if (a === undefined)
        this.zero();
      else if (b === undefined) {
        if (a._v && a._v.lenght >= 4)
          this.clone(a);
        else if (a._m && a._m.length == 9)
          this.initWithMatrix3(a);
        else if (a._m && a._m.length == 16)
          this.initWithMatrix4(a);
        else
          this.zero();
      } else if (a !== undefined && b !== undefined && c !== undefined && d !== undefined) {
        this.initWithValues(a, b, c, d);
      } else {
        this.zero();
      }
    }
    return ($traceurRuntime.createClass)(Quaternion, {
      initWithValues: function(alpha, x, y, z) {
        this._v[0] = x * bg.Math.sin(alpha / 2);
        this._v[1] = y * bg.Math.sin(alpha / 2);
        this._v[2] = z * bg.Math.sin(alpha / 2);
        this._v[3] = bg.Math.cos(alpha / 2);
        return this;
      },
      clone: function(q) {
        this._v[0] = q._v[0];
        this._v[1] = q._v[1];
        this._v[2] = q._v[2];
        this._v[3] = q._v[3];
      },
      initWithMatrix3: function(m) {
        var w = bg.Math.sqrt(1.0 + m._m[0] + m._m[4] + m._m[8]) / 2.0;
        var w4 = 4.0 * w;
        this._v[0] = (m._m[7] - m._m[5]) / w;
        this._v[1] = (m._m[2] - m._m[6]) / w4;
        this._v[2] = (m._m[3] - m._m[1]) / w4;
        this._v[3] = w;
      },
      initWithMatrix4: function(m) {
        var w = bg.Math.sqrt(1.0 + m._m[0] + m._m[5] + m._m[10]) / 2.0;
        var w4 = 4.0 * w;
        this._v[0] = (m._m[9] - m._m[6]) / w;
        this._v[1] = (m._m[2] - m._m[8]) / w4;
        this._v[2] = (m._m[4] - m._m[1]) / w4;
        this._v[3] = w;
      },
      getMatrix4: function() {
        var m = bg.Matrix4.Identity();
        var _v = this._v;
        m.setRow(0, new bg.Vector4(1.0 - 2.0 * _v[1] * _v[1] - 2.0 * _v[2] * _v[2], 2.0 * _v[0] * _v[1] - 2.0 * _v[2] * _v[3], 2.0 * _v[0] * _v[2] + 2.0 * _v[1] * _v[3], 0.0));
        m.setRow(1, new bg.Vector4(2.0 * _v[0] * _v[1] + 2.0 * _v[2] * _v[3], 1.0 - 2.0 * _v[0] * _v[0] - 2.0 * _v[2] * _v[2], 2.0 * _v[1] * _v[2] - 2.0 * _v[0] * _v[3], 0.0));
        m.setRow(2, new bg.Vector4(2.0 * _v[0] * _v[2] - 2.0 * _v[1] * _v[3], 2.0 * _v[1] * _v[2] + 2.0 * _v[0] * _v[3], 1.0 - 2.0 * _v[0] * _v[0] - 2.0 * _v[1] * _v[1], 0.0));
        return m;
      },
      getMatrix3: function() {
        var m = bg.Matrix3.Identity();
        var _v = this._v;
        m.setRow(0, new bg.Vector3(1.0 - 2.0 * _v[1] * _v[1] - 2.0 * _v[2] * _v[2], 2.0 * _v[0] * _v[1] - 2.0 * _v[2] * _v[3], 2.0 * _v[0] * _v[2] + 2.0 * _v[1] * _v[3]));
        m.setRow(1, new bg.Vector3(2.0 * _v[0] * _v[1] + 2.0 * _v[2] * _v[3], 1.0 - 2.0 * _v[0] * _v[0] - 2.0 * _v[2] * _v[2], 2.0 * _v[1] * _v[2] - 2.0 * _v[0] * _v[3]));
        m.setRow(2, new bg.Vector3(2.0 * _v[0] * _v[2] - 2.0 * _v[1] * _v[3], 2.0 * _v[1] * _v[2] + 2.0 * _v[0] * _v[3], 1.0 - 2.0 * _v[0] * _v[0] - 2.0 * _v[1] * _v[1]));
        return m;
      }
    }, {MakeWithMatrix: function(m) {
        return new Quaternion(m);
      }}, $__super);
  }(Vector4);
  bg.Quaternion = Quaternion;
})();

"use strict";
bg.physics = {};

"use strict";
(function() {
  bg.physics.IntersectionType = {
    NONE: 0,
    POINT: 1,
    LLINE: 2
  };
  var Intersection = function() {
    function Intersection() {
      this._type = null;
      this._p0 = null;
      this._p1 = null;
    }
    return ($traceurRuntime.createClass)(Intersection, {
      get type() {
        return this._type;
      },
      get point() {
        return this._p0;
      },
      get endPoint() {
        return this._p1;
      },
      intersects: function() {
        return false;
      }
    }, {RayToPlane: function(ray, plane) {
        return new bg.physics.RayToPlaneIntersection(ray, plane);
      }});
  }();
  bg.physics.Intersection = Intersection;
  var RayToPlaneIntersection = function($__super) {
    function RayToPlaneIntersection(ray, plane) {
      $traceurRuntime.superConstructor(RayToPlaneIntersection).call(this);
      this._ray = null;
      this._p0 = null;
      this._type = bg.physics.IntersectionType.POINT;
      var p0 = new bg.Vector3(plane.origin);
      var n = new bg.Vector3(plane.normal);
      var l0 = new bg.Vector3(ray.start);
      var l = new bg.Vector3(ray.vector);
      var num = p0.sub(l0).dot(n);
      var den = l.dot(n);
      if (den == 0)
        return;
      var d = num / den;
      if (d > ray.magnitude)
        return;
      this._ray = bg.physics.Ray.RayWithVector(ray.vector, ray.start, d);
      this._p0 = this._ray.end;
    }
    return ($traceurRuntime.createClass)(RayToPlaneIntersection, {
      get ray() {
        return this._ray;
      },
      intersects: function() {
        return (this._ray != null && this._p0 != null);
      }
    }, {}, $__super);
  }(bg.physics.Intersection);
  bg.physics.RayToPlaneIntersection = RayToPlaneIntersection;
})();

"use strict";
(function() {
  var Joint = function() {
    function Joint() {
      this._transform = bg.Matrix4.Identity();
    }
    return ($traceurRuntime.createClass)(Joint, {
      get transform() {
        return this._transform;
      },
      set transform(t) {
        this._transform = t;
      },
      applyTransform: function(matrix) {},
      calculateTransform: function() {}
    }, {Factory: function(linkData) {
        switch (linkData.type) {
          case 'LinkJoint':
            return LinkJoint.Factory(linkData);
            break;
        }
        return null;
      }});
  }();
  bg.physics.Joint = Joint;
  bg.physics.LinkTransformOrder = {
    TRANSLATE_ROTATE: 1,
    ROTATE_TRANSLATE: 0
  };
  var LinkJoint = function($__super) {
    function LinkJoint() {
      $traceurRuntime.superConstructor(LinkJoint).call(this);
      this._offset = new bg.Vector3();
      this._eulerRotation = new bg.Vector3();
      this._transformOrder = bg.physics.LinkTransformOrder.TRANSLATE_ROTATE;
    }
    return ($traceurRuntime.createClass)(LinkJoint, {
      applyTransform: function(matrix) {
        matrix.mult(this.transform);
      },
      assign: function(j) {
        this.yaw = j.yaw;
        this.pitch = j.pitch;
        this.roll = j.roll;
        this.offset.assign(j.offset);
        this.transformOrder = j.transformOrder;
      },
      get offset() {
        return this._offset;
      },
      set offset(o) {
        this._offset = o;
        this.calculateTransform();
      },
      get eulerRotation() {
        return this._eulerRotation;
      },
      set eulerRotation(r) {
        this._eulerRotation = r;
        this.calculateTransform();
      },
      get yaw() {
        return this._eulerRotation.x;
      },
      get pitch() {
        return this._eulerRotation.y;
      },
      get roll() {
        return this._eulerRotation.z;
      },
      set yaw(y) {
        this._eulerRotation.x = y;
        this.calculateTransform();
      },
      set pitch(p) {
        this._eulerRotation.y = p;
        this.calculateTransform();
      },
      set roll(r) {
        this._eulerRotation.z = r;
        this.calculateTransform();
      },
      get transformOrder() {
        return this._transformOrder;
      },
      set transformOrder(o) {
        this._transformOrder = o;
        this.calculateTransform();
      },
      multTransform: function(dst) {
        var offset = this.offset;
        switch (this.transformOrder) {
          case bg.physics.LinkTransformOrder.TRANSLATE_ROTATE:
            dst.translate(offset.x, offset.y, offset.z);
            this.multRotation(dst);
            break;
          case bg.physics.LinkTransformOrder.TRANSLATE_ROTATE:
            this.multRotation(dst);
            dst.translate(offset.x, offset.y, offset.z);
            break;
        }
      },
      multRotation: function(dst) {
        dst.rotate(this.eulerRotation.z, 0, 0, 1).rotate(this.eulerRotation.y, 0, 1, 0).rotate(this.eulerRotation.x, 1, 0, 0);
      },
      calculateTransform: function() {
        this.transform.identity();
        this.multTransform(this.transform);
      },
      serialize: function(data) {
        data.type = "LinkJoint";
        data.offset = [this.offset.x, this.offset.y, this.offset.z];
        data.yaw = this.yaw;
        data.pitch = this.pitch;
        data.roll = this.roll;
        data.order = this.order;
      }
    }, {Factory: function(data) {
        var result = new LinkJoint();
        result.offset = new bg.Vector3(data.offset[0] || 0, data.offset[1] || 0, data.offset[2] || 0);
        result.yaw = data.yaw || 0;
        result.pitch = data.pitch || 0;
        result.roll = data.roll || 0;
        result.order = data.order || 1;
        return result;
      }}, $__super);
  }(Joint);
  bg.physics.LinkJoint = LinkJoint;
})();

"use strict";
(function() {
  var Plane = function() {
    function Plane(a, b, c) {
      a = a instanceof bg.Vector3 && a;
      b = b instanceof bg.Vector3 && b;
      c = c instanceof bg.Vector3 && c;
      if (a && !b) {
        this._normal = new bg.Vector3(a);
        this._origin = new bg.Vector3(0);
      } else if (a && b && !c) {
        this._normal = new bg.Vector3(a);
        this._origin = new bg.Vector3(b);
      } else if (a && b && c) {
        var vec1 = new bg.Vector3(a);
        vec1.sub(b);
        var vec2 = new bg.Vector3(c);
        vec2.sub(a);
        this._origin = new bg.Vector3(p1);
        this._normal = new bg.Vector3(vec1);
        this._normal.cross(vec2).normalize();
      } else {
        this._origin = new bg.Vector3(0);
        this._normal = new bg.Vector3(0, 1, 0);
      }
    }
    return ($traceurRuntime.createClass)(Plane, {
      get normal() {
        return this._normal;
      },
      set normal(n) {
        this._normal.assign(n);
      },
      get origin() {
        return this._origin;
      },
      set origin(o) {
        this._origin.assign(o);
      },
      toString: function() {
        return ("P0: " + this._origin.toString() + ", normal:" + this._normal.toString());
      },
      valid: function() {
        return !this._origin.isNan() && !this._normal.isNan();
      },
      assign: function(p) {
        this._origin.assign(p._origin);
        this._normal.assign(p._normal);
        return this;
      },
      equals: function(p) {
        return this._origin.equals(p._origin) && this._normal.equals(p._normal);
      }
    }, {});
  }();
  bg.physics.Plane = Plane;
})();

"use strict";
(function() {
  function calculateVector(ray) {
    ray._vector = new bg.Vector3(ray._end);
    ray._vector.sub(ray._start);
    ray._magnitude = ray._vector.magnitude();
    ray._vector.normalize();
  }
  var Ray = function() {
    function Ray(start, end) {
      this._start = start || new bg.Vector3();
      this._end = end || new bg.Vector3(1);
      calculateVector(this);
    }
    return ($traceurRuntime.createClass)(Ray, {
      setWithPoints: function(start, end) {
        this._start.assign(start);
        this._end.assign(end);
        calculateVector();
        return this;
      },
      setWithVector: function(vec, origin, maxDepth) {
        this._start.assign(origin);
        this._end.assign(origin);
        var vector = new bg.Vector3(vec);
        vector.normalize().scale(maxDepth);
        this._end.add(vector);
        calculateVector(this);
        return this;
      },
      setWithScreenPoint: function(screenPoint, projMatrix, viewMatrix, viewport) {
        var start = bg.Matrix4.Unproject(screenPoint.x, screenPoint.y, 0, viewMatrix, projMatrix, viewport);
        var end = bg.Matrix4.Unproject(screenPoint.x, screenPoint.y, 1, viewMatrix, projMatrix, viewport);
        this._start = start.xyz;
        this._end = end.xyz;
        calculateVector(this);
        return this;
      },
      assign: function(r) {
        this._start.assign(r.start);
        this._end.assign(r.end);
        this._vector.assign(r.vector);
        this._magnitude.assign(r.magnitude);
      },
      get start() {
        return this._start;
      },
      set start(s) {
        this._start.assign(s);
        calculateVector(this);
      },
      get end() {
        return this._end;
      },
      set end(e) {
        this._end.assign(e);
      },
      get vector() {
        return this._vector;
      },
      get magnitude() {
        return this._magnitude;
      },
      toString: function() {
        return ("start: " + this.start.toString() + ", end: " + this.end.toString());
      }
    }, {
      RayWithPoints: function(start, end) {
        return new Ray(start, end);
      },
      RayWithVector: function(vec, origin, maxDepth) {
        var r = new Ray();
        r.setWithVector(vec, origin, maxDepth);
        return r;
      },
      RayWithScreenPoint: function(screenPoint, projMatrix, viewMatrix, viewport) {
        var r = new Ray();
        r.setWithScreenPoint(screenPoint, projMatrix, viewMatrix, viewport);
        return r;
      }
    });
  }();
  bg.physics.Ray = Ray;
})();

"use strict";
bg.scene = {};
(function() {
  var s_componentRegister = {};
  var Component = function($__super) {
    function Component() {
      $traceurRuntime.superConstructor(Component).call(this);
      this._node = null;
      this._drawGizmo = true;
    }
    return ($traceurRuntime.createClass)(Component, {
      clone: function() {
        bg.log(("WARNING: Component with typeid " + this.typeId + " does not implmement the clone() method."));
        return null;
      },
      get node() {
        return this._node;
      },
      get typeId() {
        return this._typeId;
      },
      get draw3DGizmo() {
        return this._drawGizmo;
      },
      set draw3DGizmo(d) {
        this._drawGizmo = d;
      },
      removedFromNode: function(node) {},
      addedToNode: function(node) {},
      get shouldSerialize() {
        return true;
      },
      deserialize: function(context, sceneData, url) {
        return Promise.resolve(this);
      },
      serialize: function(componentData, promises, url) {
        componentData.type = this.typeId.split(".").pop();
      },
      component: function(typeId) {
        return this._node && this._node.component(typeId);
      },
      get camera() {
        return this.component("bg.scene.Camera");
      },
      get chain() {
        return this.component("bg.scene.Chain");
      },
      get drawable() {
        return this.component("bg.scene.Drawable");
      },
      get inputChainJoint() {
        return this.component("bg.scene.InputChainJoint");
      },
      get outputChainJoint() {
        return this.component("bg.scene.OutputChainJoint");
      },
      get light() {
        return this.component("bg.scene.Light");
      },
      get transform() {
        return this.component("bg.scene.Transform");
      }
    }, {Factory: function(context, componentData, node, url) {
        var Constructor = s_componentRegister[componentData.type];
        if (Constructor) {
          var instance = new Constructor();
          node.addComponent(instance);
          return instance.deserialize(context, componentData, url);
        } else {
          return Promise.resolve();
        }
      }}, $__super);
  }(bg.LifeCycle);
  bg.scene.Component = Component;
  bg.scene.registerComponent = function(namespace, componentClass, identifier) {
    var result = /function (.+)\(/.exec(componentClass.toString());
    if (!result) {
      result = /class ([a-zA-Z0-9_]+) /.exec(componentClass.toString());
    }
    var funcName = (result && result.length > 1) ? result[1] : "";
    namespace[funcName] = componentClass;
    componentClass.prototype._typeId = identifier || funcName;
    s_componentRegister[funcName] = componentClass;
  };
})();

"use strict";
(function() {
  var SceneObjectLifeCycle = function($__super) {
    function SceneObjectLifeCycle(context) {
      $traceurRuntime.superConstructor(SceneObjectLifeCycle).call(this, context);
      this._context = context;
    }
    return ($traceurRuntime.createClass)(SceneObjectLifeCycle, {
      get context() {
        return this._context;
      },
      set context(c) {
        this._context = c;
      }
    }, {}, $__super);
  }(bg.LifeCycle);
  var SceneObject = function($__super) {
    function SceneObject(context) {
      var name = arguments[1] !== (void 0) ? arguments[1] : "";
      $traceurRuntime.superConstructor(SceneObject).call(this, context);
      this._name = name;
      this._enabled = true;
      this._components = {};
    }
    return ($traceurRuntime.createClass)(SceneObject, {
      cloneComponents: function() {
        var newNode = new bg.scene.Node(this.context, this.name ? ("copy of " + this.name) : "");
        newNode.enabled = this.enabled;
        this.forEachComponent(function(comp) {
          newNode.addComponent(comp.clone());
        });
        return newNode;
      },
      get name() {
        return this._name;
      },
      set name(n) {
        this._name = n;
      },
      get enabled() {
        return this._enabled;
      },
      set enabled(e) {
        this._enabled = e;
      },
      addComponent: function(c) {
        if (c._node) {
          c._node.removeComponent(c);
        }
        c._node = this;
        this._components[c.typeId] = c;
        c.addedToNode(this);
      },
      removeComponent: function(findComponent) {
        var typeId = "";
        var comp = null;
        if (typeof(findComponent) == "string") {
          typeId = findComponent;
          comp = this.component(findComponent);
        } else if (findComponent instanceof bg.scene.Component) {
          comp = findComponent;
          typeId = findComponent.typeId;
        }
        if (this._components[typeId] == comp && comp != null) {
          delete this._components[typeId];
          comp.removedFromNode(this);
          return true;
        }
        return false;
      },
      component: function(typeId) {
        return this._components[typeId];
      },
      get camera() {
        return this.component("bg.scene.Camera");
      },
      get chain() {
        return this.component("bg.scene.Chain");
      },
      get drawable() {
        return this.component("bg.scene.Drawable");
      },
      get inputJoint() {
        return this.component("bg.scene.InputJoint");
      },
      get outputJoint() {
        return this.component("bg.scene.OutputJoint");
      },
      get light() {
        return this.component("bg.scene.Light");
      },
      get transform() {
        return this.component("bg.scene.Transform");
      },
      forEachComponent: function(callback) {
        var keys = Object.keys(this._components);
        var $__7 = true;
        var $__8 = false;
        var $__9 = undefined;
        try {
          for (var $__5 = void 0,
              $__4 = (keys)[Symbol.iterator](); !($__7 = ($__5 = $__4.next()).done); $__7 = true) {
            var key = $__5.value;
            {
              callback(this._components[key], key, this._components);
            }
          }
        } catch ($__10) {
          $__8 = true;
          $__9 = $__10;
        } finally {
          try {
            if (!$__7 && $__4.return != null) {
              $__4.return();
            }
          } finally {
            if ($__8) {
              throw $__9;
            }
          }
        }
      },
      someComponent: function(callback) {
        var keys = Object.keys(this._components);
        var $__7 = true;
        var $__8 = false;
        var $__9 = undefined;
        try {
          for (var $__5 = void 0,
              $__4 = (keys)[Symbol.iterator](); !($__7 = ($__5 = $__4.next()).done); $__7 = true) {
            var key = $__5.value;
            {
              if (callback(this._components[key], key, this._components)) {
                return true;
              }
            }
          }
        } catch ($__10) {
          $__8 = true;
          $__9 = $__10;
        } finally {
          try {
            if (!$__7 && $__4.return != null) {
              $__4.return();
            }
          } finally {
            if ($__8) {
              throw $__9;
            }
          }
        }
        return false;
      },
      everyComponent: function(callback) {
        var keys = Object.keys(this._components);
        var $__7 = true;
        var $__8 = false;
        var $__9 = undefined;
        try {
          for (var $__5 = void 0,
              $__4 = (keys)[Symbol.iterator](); !($__7 = ($__5 = $__4.next()).done); $__7 = true) {
            var key = $__5.value;
            {
              if (!callback(this._components[key], key, this._components)) {
                return false;
              }
            }
          }
        } catch ($__10) {
          $__8 = true;
          $__9 = $__10;
        } finally {
          try {
            if (!$__7 && $__4.return != null) {
              $__4.return();
            }
          } finally {
            if ($__8) {
              throw $__9;
            }
          }
        }
        return true;
      },
      destroy: function() {
        var $__3 = this;
        this.forEachComponent(function(comp) {
          comp.removedFromNode($__3);
        });
        this._components = {};
      },
      init: function() {
        this.forEachComponent(function(comp) {
          comp.init();
        });
      },
      frame: function(delta) {
        this.forEachComponent(function(comp) {
          if (!comp._initialized_) {
            comp.init();
            comp._initialized_ = true;
          }
          comp.frame(delta);
        });
      },
      willDisplay: function(pipeline, matrixState) {
        this.forEachComponent(function(comp) {
          comp.willDisplay(pipeline, matrixState);
        });
      },
      display: function(pipeline, matrixState) {
        this.forEachComponent(function(comp) {
          comp.display(pipeline, matrixState);
        });
      },
      displayGizmo: function(pipeline, matrixState) {
        this.forEachComponent(function(comp) {
          if (comp.draw3DGizmo)
            comp.displayGizmo(pipeline, matrixState);
        });
      },
      didDisplay: function(pipeline, matrixState) {
        this.forEachComponent(function(comp) {
          comp.didDisplay(pipeline, matrixState);
        });
      },
      reshape: function(pipeline, matrixState, width, height) {
        this.forEachComponent(function(comp) {
          comp.reshape(width, height);
        });
      },
      keyDown: function(evt) {
        this.forEachComponent(function(comp) {
          comp.keyDown(evt);
        });
      },
      keyUp: function(evt) {
        this.forEachComponent(function(comp) {
          comp.keyUp(evt);
        });
      },
      mouseUp: function(evt) {
        this.forEachComponent(function(comp) {
          comp.mouseUp(evt);
        });
      },
      mouseDown: function(evt) {
        this.forEachComponent(function(comp) {
          comp.mouseDown(evt);
        });
      },
      mouseMove: function(evt) {
        this.forEachComponent(function(comp) {
          comp.mouseMove(evt);
        });
      },
      mouseOut: function(evt) {
        this.forEachComponent(function(comp) {
          comp.mouseOut(evt);
        });
      },
      mouseDrag: function(evt) {
        this.forEachComponent(function(comp) {
          comp.mouseDrag(evt);
        });
      },
      mouseWheel: function(evt) {
        this.forEachComponent(function(comp) {
          comp.mouseWheel(evt);
        });
      },
      touchStart: function(evt) {
        this.forEachComponent(function(comp) {
          comp.touchStart(evt);
        });
      },
      touchMove: function(evt) {
        this.forEachComponent(function(comp) {
          comp.touchMove(evt);
        });
      },
      touchEnd: function(evt) {
        this.forEachComponent(function(comp) {
          comp.touchEnd(evt);
        });
      }
    }, {}, $__super);
  }(SceneObjectLifeCycle);
  bg.scene.SceneObject = SceneObject;
})();

"use strict";
(function() {
  function isNodeAncient(node, ancient) {
    if (!node || !ancient) {
      return false;
    } else if (node._parent == ancient) {
      return true;
    } else {
      return isNodeAncient(node._parent, ancient);
    }
  }
  function cleanupNode(sceneNode) {
    var components = [];
    var children = [];
    sceneNode.forEachComponent(function(c) {
      return components.push(c);
    });
    sceneNode.children.forEach(function(child) {
      return children.push(child);
    });
    components.forEach(function(c) {
      return sceneNode.removeComponent(c);
    });
    children.forEach(function(child) {
      sceneNode.removeChild(child);
      cleanupNode(child);
    });
  }
  var Node = function($__super) {
    function Node(context) {
      var name = arguments[1] !== (void 0) ? arguments[1] : "";
      $traceurRuntime.superConstructor(Node).call(this, context, name);
      this._children = [];
      this._parent = null;
    }
    return ($traceurRuntime.createClass)(Node, {
      addChild: function(child) {
        if (child && !this.isAncientOf(child) && child != this) {
          if (child.parent) {
            child.parent.removeChild(child);
          }
          this._children.push(child);
          child._parent = this;
        }
      },
      removeChild: function(node) {
        var index = this._children.indexOf(node);
        if (index >= 0) {
          this._children.splice(index, 1);
        }
      },
      get children() {
        return this._children;
      },
      get parent() {
        return this._parent;
      },
      get sceneRoot() {
        if (this._parent) {
          return this._parent.sceneRoot();
        }
        return this;
      },
      haveChild: function(node) {
        return this._children.indexOf(node) != -1;
      },
      isAncientOf: function(node) {
        isNodeAncient(this, node);
      },
      accept: function(nodeVisitor) {
        if (!nodeVisitor.ignoreDisabled || this.enabled) {
          nodeVisitor.visit(this);
          this._children.forEach(function(child) {
            child.accept(nodeVisitor);
          });
          nodeVisitor.didVisit(this);
        }
      },
      acceptReverse: function(nodeVisitor) {
        if (!nodeVisitor.ignoreDisabled || this.enabled) {
          if (this._parent) {
            this._parent.acceptReverse(nodeVisitor);
          }
          nodeVisitor.visit(this);
        }
      },
      destroy: function() {
        $traceurRuntime.superGet(this, Node.prototype, "destroy").call(this);
        this._children.forEach(function(child) {
          child.destroy();
        });
        this._children = [];
      }
    }, {CleanupNode: function(node) {
        cleanupNode(node);
      }}, $__super);
  }(bg.scene.SceneObject);
  bg.scene.Node = Node;
  var NodeVisitor = function() {
    function NodeVisitor() {
      this._ignoreDisabled = true;
    }
    return ($traceurRuntime.createClass)(NodeVisitor, {
      get ignoreDisabled() {
        return this._ignoreDisabled;
      },
      set ignoreDisabled(v) {
        this._ignoreDisabled = v;
      },
      visit: function(node) {},
      didVisit: function(node) {}
    }, {});
  }();
  bg.scene.NodeVisitor = NodeVisitor;
})();

"use strict";
(function() {
  var ProjectionStrategy = function($__super) {
    function ProjectionStrategy(target) {
      $traceurRuntime.superConstructor(ProjectionStrategy).call(this, target);
      this._near = 0.1;
      this._far = 100.0;
      this._viewport = new bg.Viewport(0, 0, 512, 512);
    }
    return ($traceurRuntime.createClass)(ProjectionStrategy, {
      clone: function() {
        console.log("WARNING: ProjectionStrategy::clone() method not implemented by child class.");
      },
      get near() {
        return this._near;
      },
      set near(n) {
        this._near = n;
      },
      get far() {
        return this._far;
      },
      set far(f) {
        this._far = f;
      },
      get viewport() {
        return this._viewport;
      },
      set viewport(vp) {
        this._viewport = vp;
      },
      get fov() {
        return 0;
      },
      serialize: function(jsonData) {
        jsonData.near = this.near;
        jsonData.far = this.far;
      }
    }, {Factory: function(jsonData) {
        var result = null;
        if (jsonData) {
          if (jsonData.type == "PerspectiveProjectionMethod") {
            result = new PerspectiveProjectionStrategy();
          } else if (jsonData.type == "OpticalProjectionMethod") {
            result = new OpticalProjectionStrategy();
          }
          if (result) {
            result.deserialize(jsonData);
          }
        }
        return result;
      }}, $__super);
  }(bg.MatrixStrategy);
  bg.scene.ProjectionStrategy = ProjectionStrategy;
  var PerspectiveProjectionStrategy = function($__super) {
    function PerspectiveProjectionStrategy(target) {
      $traceurRuntime.superConstructor(PerspectiveProjectionStrategy).call(this, target);
      this._fov = 60;
    }
    return ($traceurRuntime.createClass)(PerspectiveProjectionStrategy, {
      clone: function() {
        var result = new PerspectiveProjectionStrategy();
        result.near = this.near;
        result.far = this.far;
        result.viewport = this.viewport;
        result.fov = this.fov;
        return result;
      },
      get fov() {
        return this._fov;
      },
      set fov(f) {
        this._fov = f;
      },
      apply: function() {
        if (this.target) {
          this.target.perspective(this.fov, this.viewport.aspectRatio, this.near, this.far);
        }
      },
      deserialize: function(jsonData) {
        this.near = jsonData.near;
        this.far = jsonData.far;
        this.fov = jsonData.fov;
      },
      serialize: function(jsonData) {
        jsonData.type = "PerspectiveProjectionMethod";
        jsonData.fov = this.fov;
        $traceurRuntime.superGet(this, PerspectiveProjectionStrategy.prototype, "serialize").call(this, jsonData);
      }
    }, {}, $__super);
  }(ProjectionStrategy);
  bg.scene.PerspectiveProjectionStrategy = PerspectiveProjectionStrategy;
  var OpticalProjectionStrategy = function($__super) {
    function OpticalProjectionStrategy(target) {
      $traceurRuntime.superConstructor(OpticalProjectionStrategy).call(this, target);
      this._focalLength = 50;
      this._frameSize = 35;
    }
    return ($traceurRuntime.createClass)(OpticalProjectionStrategy, {
      clone: function() {
        var result = new OpticalProjectionStrategy();
        result.near = this.near;
        result.far = this.far;
        result.viewport = this.viewport;
        result.focalLength = this.focalLength;
        result.frameSize = this.frameSize;
        return result;
      },
      get focalLength() {
        return this._focalLength;
      },
      set focalLength(fl) {
        this._focalLength = fl;
      },
      get frameSize() {
        return this._frameSize;
      },
      set frameSize(s) {
        this._frameSize = s;
      },
      get fov() {
        return 2 * bg.Math.atan(this.frameSize / (this.focalLength / 2));
      },
      apply: function() {
        if (this.target) {
          var fov = this.fov;
          fov = bg.Math.radiansToDegrees(fov);
          this.target.perspective(fov, this.viewport.aspectRatio, this.near, this.far);
        }
      },
      deserialize: function(jsonData) {
        this.frameSize = jsonData.frameSize;
        this.focalLength = jsonData.focalLength;
        this.near = jsonData.near;
        this.far = jsonData.far;
      },
      serialize: function(jsonData) {
        jsonData.type = "OpticalProjectionMethod";
        jsonData.frameSize = this.frameSize;
        jsonData.focalLength = this.focalLength;
        $traceurRuntime.superGet(this, OpticalProjectionStrategy.prototype, "serialize").call(this, jsonData);
      }
    }, {}, $__super);
  }(ProjectionStrategy);
  bg.scene.OpticalProjectionStrategy = OpticalProjectionStrategy;
  function buildPlist(context, vertex, color) {
    var plist = new bg.base.PolyList(context);
    var normal = [];
    var texCoord0 = [];
    var index = [];
    var currentIndex = 0;
    for (var i = 0; i < vertex.length; i += 3) {
      normal.push(0);
      normal.push(0);
      normal.push(1);
      texCoord0.push(0);
      texCoord0.push(0);
      index.push(currentIndex++);
    }
    plist.vertex = vertex;
    plist.normal = normal;
    plist.texCoord0 = texCoord0;
    plist.color = color;
    plist.index = index;
    plist.drawMode = bg.base.DrawMode.LINES;
    plist.build();
    return plist;
  }
  function getGizmo() {
    if (!this._gizmo) {
      var alpha = this.projectionStrategy ? this.projectionStrategy.fov : bg.Math.PI_4;
      alpha *= 0.5;
      var d = this.focus;
      var aspectRatio = bg.app.MainLoop.singleton.canvas.width / bg.app.MainLoop.singleton.canvas.height;
      var sx = bg.Math.sin(alpha) * d;
      var sy = (bg.Math.sin(alpha) * d) / aspectRatio;
      var vertex = [0, 0, 0, sx, sy, -d, 0, 0, 0, -sx, sy, -d, 0, 0, 0, sx, -sy, -d, 0, 0, 0, -sx, -sy, -d, sx, sy, -d, -sx, sy, -d, -sx, sy, -d, -sx, -sy, -d, -sx, -sy, -d, sx, -sy, -d, sx, -sy, -d, sx, sy, -d];
      var color = [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1];
      this._gizmo = buildPlist(this.node.context, vertex, color);
    }
    return this._gizmo;
  }
  function clearMain(node) {
    if (node.camera) {
      node.camera.isMain = false;
    }
    node.children.forEach(function(child) {
      return clearMain(child);
    });
  }
  var Camera = function($__super) {
    function Camera() {
      $traceurRuntime.superConstructor(Camera).call(this);
      this._projection = bg.Matrix4.Perspective(60, 1, 0.1, 100.0);
      this._viewport = new bg.Viewport(0, 0, 512, 512);
      this._visitor = new bg.scene.TransformVisitor();
      this._rebuildTransform = true;
      this._clearBuffers = bg.base.ClearBuffers.COLOR_DEPTH;
      this._focus = 5;
      this._projectionStrategy = null;
      this._isMain = false;
    }
    return ($traceurRuntime.createClass)(Camera, {
      clone: function() {
        var newCamera = new bg.scene.Camera();
        newCamera._projection = new bg.Matrix4(this._projection);
        newCamera._viewport = new bg.Matrix4(this._viewport);
        newCamera._projectionStrategy = this._projectionStrategy ? this._projectionStrategy.clone() : null;
        return newCamera;
      },
      get projection() {
        return this._projection;
      },
      set projection(p) {
        if (!this._projectionStrategy) {
          this._projection = p;
        }
      },
      get viewport() {
        return this._viewport;
      },
      set viewport(v) {
        this._viewport = v;
        if (this._projectionStrategy) {
          this._projectionStrategy.viewport = v;
          this._projectionStrategy.apply();
        }
      },
      get focus() {
        return this._focus;
      },
      set focus(f) {
        this._focus = f;
        this.recalculateGizmo();
      },
      get isMain() {
        return this._isMain;
      },
      set isMain(m) {
        this._isMain = m;
      },
      get projectionStrategy() {
        return this._projectionStrategy;
      },
      set projectionStrategy(ps) {
        this._projectionStrategy = ps;
        if (this._projectionStrategy) {
          this._projectionStrategy.target = this._projection;
        }
        this.recalculateGizmo();
      },
      get clearBuffers() {
        return this._clearBuffers;
      },
      set clearBuffers(c) {
        this._clearBuffers = c;
      },
      get modelMatrix() {
        if (this._rebuildTransform && this.node) {
          this._visitor.matrix.identity();
          this.node.acceptReverse(this._visitor);
          this._rebuildTransform = false;
        }
        return this._visitor.matrix;
      },
      get viewMatrix() {
        if (!this._viewMatrix || this._rebuildTransform) {
          this._viewMatrix = new bg.Matrix4(this.modelMatrix);
          this._viewMatrix.invert();
        }
        return this._viewMatrix;
      },
      recalculateGizmo: function() {
        if (this._gizmo) {
          this._gizmo.destroy();
          this._gizmo = null;
        }
      },
      frame: function(delta) {
        this._rebuildTransform = true;
      },
      displayGizmo: function(pipeline, matrixState) {
        if (this.isMain)
          return;
        var plist = getGizmo.apply(this);
        if (plist) {
          pipeline.draw(plist);
        }
      },
      serialize: function(componentData, promises, url) {
        $traceurRuntime.superGet(this, Camera.prototype, "serialize").call(this, componentData, promises, url);
        componentData.isMain = this.isMain;
        if (this.projectionStrategy) {
          var projMethod = {};
          componentData.projectionMethod = projMethod;
          this.projectionStrategy.serialize(projMethod);
        }
      },
      deserialize: function(context, sceneData, url) {
        sceneData.isMain = sceneData.isMain || false;
        this.projectionStrategy = ProjectionStrategy.Factory(sceneData.projectionMethod || {});
      }
    }, {SetAsMainCamera: function(mainCamera, sceneRoot) {
        clearMain(sceneRoot);
        if (mainCamera instanceof Camera) {
          mainCamera.isMain = true;
        } else if (mainCamera instanceof bg.scene.Node && mainCamera.camera) {
          mainCamera.camera.isMain = true;
        } else {
          throw new Error("Error setting main camera: invalid camera node.");
        }
      }}, $__super);
  }(bg.scene.Component);
  bg.scene.registerComponent(bg.scene, Camera, "bg.scene.Camera");
})();

"use strict";
(function() {
  var Chain = function($__super) {
    function Chain() {
      $traceurRuntime.superConstructor(Chain).call(this);
    }
    return ($traceurRuntime.createClass)(Chain, {
      clone: function() {
        return new bg.scene.Chain();
      },
      willDisplay: function(pipeline, matrixState) {
        if (this.node) {
          var matrix = bg.Matrix4.Identity();
          this.node.children.forEach(function(child) {
            var trx = child.component("bg.scene.Transform");
            var inJoint = child.component("bg.scene.InputChainJoint");
            var outJoint = child.component("bg.scene.OutputChainJoint");
            if (inJoint) {
              inJoint.joint.applyTransform(matrix);
            } else {
              matrix.identity();
            }
            if (trx) {
              trx.matrix.assign(matrix);
            }
            if (outJoint) {
              outJoint.joint.applyTransform(matrix);
            }
          });
        }
      }
    }, {}, $__super);
  }(bg.scene.Component);
  bg.scene.registerComponent(bg.scene, Chain, "bg.scene.Chain");
  var ChainJoint = function($__super) {
    function ChainJoint() {
      $traceurRuntime.superConstructor(ChainJoint).call(this);
      this._joint = new bg.physics.LinkJoint();
    }
    return ($traceurRuntime.createClass)(ChainJoint, {
      get joint() {
        return this._joint;
      },
      set joint(j) {
        this._joint = j;
      },
      deserialize: function(context, sceneData, url) {
        if (sceneData.joint) {
          this.joint = bg.physics.Joint.Factory(sceneData.joint);
        }
      }
    }, {}, $__super);
  }(bg.scene.Component);
  bg.scene.ChainJoint = ChainJoint;
  var InputChainJoint = function($__super) {
    function InputChainJoint(joint) {
      $traceurRuntime.superConstructor(InputChainJoint).call(this);
      if (joint) {
        this.joint = joint;
      } else {
        this.joint.transformOrder = bg.physics.LinkTransformOrder.ROTATE_TRANSLATE;
      }
    }
    return ($traceurRuntime.createClass)(InputChainJoint, {
      clone: function() {
        var newJoint = new bg.scene.InputChainJoint();
        newJoint.joint.assign(this.joint);
        return newJoint;
      },
      serialize: function(componentData, promises, url) {
        $traceurRuntime.superGet(this, InputChainJoint.prototype, "serialize").call(this, componentData, promises, url);
        componentData.joint = {};
        this.joint.serialize(componentData.joint);
      }
    }, {}, $__super);
  }(ChainJoint);
  bg.scene.registerComponent(bg.scene, InputChainJoint, "bg.scene.InputChainJoint");
  var OutputChainJoint = function($__super) {
    function OutputChainJoint(joint) {
      $traceurRuntime.superConstructor(OutputChainJoint).call(this);
      if (joint) {
        this.joint = joint;
      } else {
        this.joint.transformOrder = bg.physics.LinkTransformOrder.TRANSLATE_ROTATE;
      }
    }
    return ($traceurRuntime.createClass)(OutputChainJoint, {
      clone: function() {
        var newJoint = new bg.scene.OutputChainJoint();
        newJoint.joint.assign(this.joint);
        return newJoint;
      },
      serialize: function(componentData, promises, url) {
        $traceurRuntime.superGet(this, OutputChainJoint.prototype, "serialize").call(this, componentData, promises, url);
        componentData.joint = {};
        this.joint.serialize(componentData.joint);
      }
    }, {}, $__super);
  }(ChainJoint);
  bg.scene.registerComponent(bg.scene, OutputChainJoint, "bg.scene.OutputChainJoint");
})();

"use strict";
(function() {
  bg.scene.CubemapImage = {
    POSITIVE_X: 0,
    NEGATIVE_X: 1,
    POSITIVE_Y: 2,
    NEGATIVE_Y: 3,
    POSITIVE_Z: 4,
    NEGATIVE_Z: 5
  };
  var g_currentCubemap = null;
  function copyCubemapImage(componentData, cubemapImage, dstPath) {
    var path = require("path");
    var src = bg.base.Writer.StandarizePath(this.getImageUrl(cubemapImage));
    var file = src.split('/').pop();
    var dst = bg.base.Writer.StandarizePath(path.join(dstPath, file));
    switch (cubemapImage) {
      case bg.scene.CubemapImage.POSITIVE_X:
        componentData.positiveX = file;
        break;
      case bg.scene.CubemapImage.NEGATIVE_X:
        componentData.negativeX = file;
        break;
      case bg.scene.CubemapImage.POSITIVE_Y:
        componentData.positiveY = file;
        break;
      case bg.scene.CubemapImage.NEGATIVE_Y:
        componentData.negativeY = file;
        break;
      case bg.scene.CubemapImage.POSITIVE_Z:
        componentData.positiveZ = file;
        break;
      case bg.scene.CubemapImage.NEGATIVE_Z:
        componentData.negativeZ = file;
        break;
    }
    return bg.base.Writer.CopyFile(src, dst);
  }
  var Cubemap = function($__super) {
    function Cubemap() {
      $traceurRuntime.superConstructor(Cubemap).call(this);
      this._images = [null, null, null, null, null, null];
      this._texture = null;
    }
    return ($traceurRuntime.createClass)(Cubemap, {
      setImageUrl: function(imgCode, texture) {
        this._images[imgCode] = texture;
      },
      getImageUrl: function(imgCode) {
        return this._images[imgCode];
      },
      get texture() {
        return this._texture;
      },
      loadCubemap: function(context) {
        var $__1 = this;
        context = context || this.node && this.node.context;
        return new Promise(function(resolve, reject) {
          bg.utils.Resource.LoadMultiple($__1._images).then(function(result) {
            $__1._texture = new bg.base.Texture(context);
            $__1._texture.target = bg.base.TextureTarget.CUBE_MAP;
            $__1._texture.create();
            $__1._texture.bind();
            $__1._texture.setCubemap(result[$__1.getImageUrl(bg.scene.CubemapImage.POSITIVE_X)], result[$__1.getImageUrl(bg.scene.CubemapImage.NEGATIVE_X)], result[$__1.getImageUrl(bg.scene.CubemapImage.POSITIVE_Y)], result[$__1.getImageUrl(bg.scene.CubemapImage.NEGATIVE_Y)], result[$__1.getImageUrl(bg.scene.CubemapImage.POSITIVE_Z)], result[$__1.getImageUrl(bg.scene.CubemapImage.NEGATIVE_Z)]);
            g_currentCubemap = $__1._texture;
            bg.emitImageLoadEvent(result[$__1.getImageUrl(bg.scene.CubemapImage.POSITIVE_X)]);
            resolve($__1);
          }).catch(function(err) {
            reject(err);
          });
        });
      },
      clone: function() {
        var cubemap = new Cubemap();
        for (var code in this._images) {
          cubemap._images[code] = this._images[code];
        }
        ;
        cubemap._texture = this._texture;
        return cubemap;
      },
      deserialize: function(context, sceneData, url) {
        this.setImageUrl(bg.scene.CubemapImage.POSITIVE_X, bg.utils.Resource.JoinUrl(url, sceneData["positiveX"]));
        this.setImageUrl(bg.scene.CubemapImage.NEGATIVE_X, bg.utils.Resource.JoinUrl(url, sceneData["negativeX"]));
        this.setImageUrl(bg.scene.CubemapImage.POSITIVE_Y, bg.utils.Resource.JoinUrl(url, sceneData["positiveY"]));
        this.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Y, bg.utils.Resource.JoinUrl(url, sceneData["negativeY"]));
        this.setImageUrl(bg.scene.CubemapImage.POSITIVE_Z, bg.utils.Resource.JoinUrl(url, sceneData["positiveZ"]));
        this.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Z, bg.utils.Resource.JoinUrl(url, sceneData["negativeZ"]));
        return this.loadCubemap(context);
      },
      serialize: function(componentData, promises, url) {
        $traceurRuntime.superGet(this, Cubemap.prototype, "serialize").call(this, componentData, promises, url);
        if (!bg.isElectronApp)
          return;
        promises.push(copyCubemapImage.apply(this, [componentData, bg.scene.CubemapImage.POSITIVE_X, url.path]));
        promises.push(copyCubemapImage.apply(this, [componentData, bg.scene.CubemapImage.NEGATIVE_X, url.path]));
        promises.push(copyCubemapImage.apply(this, [componentData, bg.scene.CubemapImage.POSITIVE_Y, url.path]));
        promises.push(copyCubemapImage.apply(this, [componentData, bg.scene.CubemapImage.NEGATIVE_Y, url.path]));
        promises.push(copyCubemapImage.apply(this, [componentData, bg.scene.CubemapImage.POSITIVE_Z, url.path]));
        promises.push(copyCubemapImage.apply(this, [componentData, bg.scene.CubemapImage.NEGATIVE_Z, url.path]));
      }
    }, {Current: function(context) {
        if (!g_currentCubemap) {
          g_currentCubemap = bg.base.TextureCache.WhiteCubemap(context);
        }
        return g_currentCubemap;
      }}, $__super);
  }(bg.scene.Component);
  bg.scene.registerComponent(bg.scene, Cubemap, "bg.scene.Cubemap");
})();

"use strict";
(function() {
  var Drawable = function($__super) {
    function Drawable() {
      var name = arguments[0] !== (void 0) ? arguments[0] : "";
      $traceurRuntime.superConstructor(Drawable).call(this);
      this._name = name;
      this._items = [];
    }
    return ($traceurRuntime.createClass)(Drawable, {
      get name() {
        return this._name;
      },
      set name(n) {
        this._name = n;
      },
      clone: function(newName) {
        var newInstance = new bg.scene.Drawable();
        newInstance.name = newName || ("copy of " + this.name);
        this.forEach(function(plist, material, trx) {
          newInstance.addPolyList(plist.clone(), material.clone(), trx ? new bg.Matrix4(trx) : null);
        });
        return newInstance;
      },
      instance: function(newName) {
        var newInstance = new bg.scene.Drawable();
        newInstance.name = newName || ("copy of " + this.name);
        this.forEach(function(plist, material, trx) {
          newInstance.addPolyList(plist, material.clone(), trx ? new bg.Matrix4(trx) : null);
        });
        return newInstance;
      },
      addPolyList: function(plist, mat) {
        var trx = arguments[2] !== (void 0) ? arguments[2] : null;
        if (plist && this.indexOf(plist) == -1) {
          mat = mat || new bg.base.Material();
          this._items.push({
            polyList: plist,
            material: mat,
            transform: trx
          });
          return true;
        }
        return false;
      },
      applyMaterialDefinition: function(materialDefinitions, resourcesUrl) {
        var promises = [];
        this.forEach(function(plist, mat) {
          var definition = materialDefinitions[plist.name];
          if (definition) {
            promises.push(new Promise(function(resolve, reject) {
              var modifier = new bg.base.MaterialModifier(definition);
              mat.applyModifier(plist.context, modifier, resourcesUrl);
              resolve();
            }));
          }
        });
        return Promise.all(promises);
      },
      removePolyList: function(plist) {
        var index = -1;
        this._items.some(function(item, i) {
          if (plist == item.polyList) {
            index = i;
          }
        });
        if (index >= 0) {
          this._items.splice(index, 1);
        }
      },
      indexOf: function(plist) {
        var index = -1;
        this._items.some(function(item, i) {
          if (item.polyList == item) {
            index = i;
            return true;
          }
        });
        return index;
      },
      replacePolyList: function(index, plist) {
        if (index >= 0 && index < this._items.length) {
          this._items[index].polyList = plist;
          return true;
        }
        return false;
      },
      replaceMaterial: function(index, mat) {
        if (index >= 0 && index < this._items.length) {
          this._items[index].material = mat;
          return true;
        }
        return false;
      },
      replaceTransform: function(index, trx) {
        if (index >= 0 && index < this._items.length) {
          this._items[index].transform = trx;
          return true;
        }
        return false;
      },
      getPolyList: function(index) {
        if (index >= 0 && index < this._items.length) {
          return this._items[index].polyList;
        }
        return false;
      },
      getMaterial: function(index) {
        if (index >= 0 && index < this._items.length) {
          return this._items[index].material;
        }
        return false;
      },
      getTransform: function(index) {
        if (index >= 0 && index < this._items.length) {
          return this._items[index].transform;
        }
        return false;
      },
      forEach: function(callback) {
        var $__6 = true;
        var $__7 = false;
        var $__8 = undefined;
        try {
          for (var $__4 = void 0,
              $__3 = (this._items)[Symbol.iterator](); !($__6 = ($__4 = $__3.next()).done); $__6 = true) {
            var elem = $__4.value;
            {
              callback(elem.polyList, elem.material, elem.transform);
            }
          }
        } catch ($__9) {
          $__7 = true;
          $__8 = $__9;
        } finally {
          try {
            if (!$__6 && $__3.return != null) {
              $__3.return();
            }
          } finally {
            if ($__7) {
              throw $__8;
            }
          }
        }
      },
      some: function(callback) {
        var $__6 = true;
        var $__7 = false;
        var $__8 = undefined;
        try {
          for (var $__4 = void 0,
              $__3 = (this._items)[Symbol.iterator](); !($__6 = ($__4 = $__3.next()).done); $__6 = true) {
            var elem = $__4.value;
            {
              if (callback(elem.polyList, elem.material, elem.transform)) {
                return true;
              }
            }
          }
        } catch ($__9) {
          $__7 = true;
          $__8 = $__9;
        } finally {
          try {
            if (!$__6 && $__3.return != null) {
              $__3.return();
            }
          } finally {
            if ($__7) {
              throw $__8;
            }
          }
        }
        return false;
      },
      every: function(callback) {
        var $__6 = true;
        var $__7 = false;
        var $__8 = undefined;
        try {
          for (var $__4 = void 0,
              $__3 = (this._items)[Symbol.iterator](); !($__6 = ($__4 = $__3.next()).done); $__6 = true) {
            var elem = $__4.value;
            {
              if (!callback(elem.polyList, elem.material, elem.transform)) {
                return false;
              }
            }
          }
        } catch ($__9) {
          $__7 = true;
          $__8 = $__9;
        } finally {
          try {
            if (!$__6 && $__3.return != null) {
              $__3.return();
            }
          } finally {
            if ($__7) {
              throw $__8;
            }
          }
        }
        return true;
      },
      display: function(pipeline, matrixState) {
        if (!pipeline.effect) {
          throw new Error("Could not draw component: invalid effect found.");
        }
        if (!this.node.enabled) {
          return;
        } else {
          this.forEach(function(plist, mat, trx) {
            if (plist.visible) {
              var currMaterial = pipeline.effect.material;
              if (trx) {
                matrixState.modelMatrixStack.push();
                matrixState.modelMatrixStack.mult(trx);
              }
              if (pipeline.shouldDraw(mat)) {
                pipeline.effect.material = mat;
                pipeline.draw(plist);
              }
              if (trx) {
                matrixState.modelMatrixStack.pop();
              }
              pipeline.effect.material = currMaterial;
            }
          });
        }
      },
      setGroupVisible: function(groupName) {
        var visibility = arguments[1] !== (void 0) ? arguments[1] : true;
        this.forEach(function(plist) {
          if (plist.groupName == groupName) {
            plist.visible = visibility;
          }
        });
      },
      hideGroup: function(groupName) {
        this.setGroupVisible(groupName, false);
      },
      showGroup: function(groupName) {
        this.setGroupVisible(groupName, true);
      },
      setVisibleByName: function(name) {
        var visibility = arguments[1] !== (void 0) ? arguments[1] : true;
        this.some(function(plist) {
          if (plist.name == name) {
            plist.visible = visibility;
            return true;
          }
        });
      },
      showByName: function(name) {
        this.setVisibleByName(name, true);
      },
      hideByName: function(name) {
        this.setVisibleByName(name, false);
      },
      deserialize: function(context, sceneData, url) {
        var $__2 = this;
        return new Promise(function(resolve, reject) {
          var modelUrl = bg.utils.Resource.JoinUrl(url, sceneData.name + '.vwglb');
          bg.base.Loader.Load(context, modelUrl).then(function(node) {
            var drw = node.component("bg.scene.Drawable");
            $__2._name = sceneData.name;
            $__2._items = drw._items;
            resolve($__2);
          });
        });
      },
      serialize: function(componentData, promises, url) {
        var $__2 = this;
        if (!bg.isElectronApp) {
          return;
        }
        $traceurRuntime.superGet(this, Drawable.prototype, "serialize").call(this, componentData, promises, url);
        if (!this.name) {
          this.name = bg.utils.generateUUID();
        }
        componentData.name = this.name;
        var path = require('path');
        var dst = path.join(url.path, componentData.name + ".vwglb");
        promises.push(new Promise(function(resolve, reject) {
          bg.base.Writer.Write(dst, $__2.node).then(function() {
            return resolve();
          }).catch(function(err) {
            return reject(err);
          });
        }));
      }
    }, {InstanceNode: function(node) {
        var newNode = new bg.scene.Node(node.context, node.name ? ("copy of " + node.name) : "");
        newNode.enabled = node.enabled;
        node.forEachComponent(function(comp) {
          var newComp = null;
          if (comp instanceof Drawable) {
            newComp = comp.instance();
          } else {
            newComp = comp.clone();
          }
          newNode.addComponent(newComp);
        });
        return newNode;
      }}, $__super);
  }(bg.scene.Component);
  bg.scene.registerComponent(bg.scene, Drawable, "bg.scene.Drawable");
})();

"use strict";
(function() {
  var s_lightRegister = [];
  function registerLight(l) {
    s_lightRegister.push(l);
  }
  function unregisterLight(l) {
    var i = s_lightRegister.indexOf(l);
    if (i != -1) {
      s_lightRegister.splice(i, 1);
    }
  }
  function buildPlist(context, vertex, color) {
    var plist = new bg.base.PolyList(context);
    var normal = [];
    var texCoord0 = [];
    var index = [];
    var currentIndex = 0;
    for (var i = 0; i < vertex.length; i += 3) {
      normal.push(0);
      normal.push(0);
      normal.push(1);
      texCoord0.push(0);
      texCoord0.push(0);
      index.push(currentIndex++);
    }
    plist.vertex = vertex;
    plist.normal = normal;
    plist.texCoord0 = texCoord0;
    plist.color = color;
    plist.index = index;
    plist.drawMode = bg.base.DrawMode.LINES;
    plist.build();
    return plist;
  }
  function getDirectionalGizmo(conext) {
    if (!this._directionalGizmo) {
      var context = this.node.context;
      var vertex = [0, 0, 0, 0, 0, -1, 0, 0, -1, 0, 0.1, -0.9, 0, 0, -1, 0, -0.1, -0.9];
      var color = [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1];
      this._directionalGizmo = buildPlist(context, vertex, color);
    }
    return this._directionalGizmo;
  }
  function getSpotGizmo() {
    var context = this.node.context;
    var distance = 5;
    var alpha = bg.Math.degreesToRadians(this.light.spotCutoff / 2);
    var salpha = bg.Math.sin(alpha) * distance;
    var calpha = bg.Math.cos(alpha) * distance;
    var rx2 = bg.Math.cos(bg.Math.PI_8) * salpha;
    var rx1 = bg.Math.cos(bg.Math.PI_4) * salpha;
    var rx0 = bg.Math.cos(bg.Math.PI_4 + bg.Math.PI_8) * salpha;
    var ry2 = bg.Math.sin(bg.Math.PI_8) * salpha;
    var ry1 = bg.Math.sin(bg.Math.PI_4) * salpha;
    var ry0 = bg.Math.sin(bg.Math.PI_4 + bg.Math.PI_8) * salpha;
    var vertex = [0, 0, 0, 0, salpha, -calpha, 0, 0, 0, 0, -salpha, -calpha, 0, 0, 0, salpha, 0, -calpha, 0, 0, 0, -salpha, 0, -calpha, 0, salpha, -calpha, rx0, ry0, -calpha, rx0, ry0, -calpha, rx1, ry1, -calpha, rx1, ry1, -calpha, rx2, ry2, -calpha, rx2, ry2, -calpha, salpha, 0, -calpha, salpha, 0, -calpha, rx2, -ry2, -calpha, rx2, -ry2, -calpha, rx1, -ry1, -calpha, rx1, -ry1, -calpha, rx0, -ry0, -calpha, rx0, -ry0, -calpha, 0, -salpha, -calpha, 0, -salpha, -calpha, -rx0, -ry0, -calpha, -rx0, -ry0, -calpha, -rx1, -ry1, -calpha, -rx1, -ry1, -calpha, -rx2, -ry2, -calpha, -rx2, -ry2, -calpha, -salpha, 0, -calpha, -salpha, 0, -calpha, -rx2, ry2, -calpha, -rx2, ry2, -calpha, -rx1, ry1, -calpha, -rx1, ry1, -calpha, -rx0, ry0, -calpha, -rx0, ry0, -calpha, 0, salpha, -calpha];
    var color = [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1];
    if (!this._spotGizmo) {
      this._spotGizmo = buildPlist(context, vertex, color);
    } else {
      this._spotGizmo.updateBuffer(bg.base.BufferType.VERTEX, vertex);
      this._spotGizmo.updateBuffer(bg.base.BufferType.COLOR, color);
    }
    return this._spotGizmo;
  }
  function getPointGizmo() {
    if (!this._pointGizmo) {
      var context = this.node.context;
      var r = 0.5;
      var s = bg.Math.sin(bg.Math.PI_4) * r;
      var vertex = [0, 0, 0, 0, r, 0, 0, 0, 0, 0, -r, 0, 0, 0, 0, -r, 0, 0, 0, 0, 0, r, 0, 0, 0, 0, 0, s, s, 0, 0, 0, 0, s, -s, 0, 0, 0, 0, -s, s, 0, 0, 0, 0, -s, -s, 0, 0, 0, 0, 0, 0, r, 0, 0, 0, 0, 0, -r, 0, 0, 0, 0, s, s, 0, 0, 0, 0, -s, s, 0, 0, 0, 0, -s, -s, 0, 0, 0, 0, s, -s, 0, 0, 0, s, 0, s, 0, 0, 0, -s, 0, s, 0, 0, 0, -s, 0, -s, 0, 0, 0, s, 0, -s];
      var color = [1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1];
      this._pointGizmo = buildPlist(context, vertex, color);
    }
    return this._pointGizmo;
  }
  function getGizmo() {
    switch (this._light && this._light.type) {
      case bg.base.LightType.DIRECTIONAL:
        return getDirectionalGizmo.apply(this);
      case bg.base.LightType.SPOT:
        return getSpotGizmo.apply(this);
      case bg.base.LightType.POINT:
        return getPointGizmo.apply(this);
    }
    return null;
  }
  var Light = function($__super) {
    function Light() {
      var light = arguments[0] !== (void 0) ? arguments[0] : null;
      $traceurRuntime.superConstructor(Light).call(this);
      this._light = light;
      this._visitor = new bg.scene.TransformVisitor();
      this._rebuildTransform = true;
    }
    return ($traceurRuntime.createClass)(Light, {
      clone: function() {
        var newLight = new bg.scene.Light();
        newLight.light = this.light.clone();
        return newLight;
      },
      get light() {
        return this._light;
      },
      set light(l) {
        this._light = l;
      },
      get transform() {
        if (this._rebuildTransform && this.node) {
          this._visitor.matrix.identity();
          this.node.acceptReverse(this._visitor);
          this._rebuildTransform = false;
        }
        return this._visitor.matrix;
      },
      frame: function(delta) {
        this._rebuildTransform = true;
        this.transform;
      },
      displayGizmo: function(pipeline, matrixState) {
        var plist = getGizmo.apply(this);
        if (plist) {
          pipeline.draw(plist);
        }
      },
      removedFromNode: function(node) {
        unregisterLight(this);
      },
      addedToNode: function(node) {
        registerLight(this);
      },
      deserialize: function(context, sceneData, url) {
        var $__1 = this;
        return new Promise(function(resolve, reject) {
          $__1._light = new bg.base.Light(context);
          $__1._light.deserialize(sceneData);
          resolve($__1);
        });
      },
      serialize: function(componentData, promises, url) {
        $traceurRuntime.superGet(this, Light.prototype, "serialize").call(this, componentData, promises, url);
        this.light.serialize(componentData);
      }
    }, {GetActiveLights: function() {
        return s_lightRegister;
      }}, $__super);
  }(bg.scene.Component);
  bg.scene.registerComponent(bg.scene, Light, "bg.scene.Light");
})();

"use strict";
(function() {
  function parseMTL_n(line) {
    var res = /newmtl\s+(.*)/.exec(line);
    if (res) {
      this._jsonData[res[1]] = JSON.parse(JSON.stringify(s_matInit));
      this._currentMat = this._jsonData[res[1]];
    }
  }
  function parseMTL_N(line) {
    var res = /Ns\s+([\d\.]+)/.exec(line);
    if (res) {
      this._currentMat.shininess = Number(res[1]);
    }
  }
  function vectorFromRE(re) {
    return [Number(re[1]), Number(re[2]), Number(re[3]), re[4] ? Number(re[4]) : 1.0];
  }
  function parseMTL_K(line) {
    var res = /Kd\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s*([\d\.]*)/.exec(line);
    if (res) {
      var d = vectorFromRE(res);
      this._currentMat.diffuseR = d[0];
      this._currentMat.diffuseG = d[1];
      this._currentMat.diffuseB = d[2];
      this._currentMat.diffuseA = d[3];
    } else if ((res = /Ks\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)\s*([\d\.]*)/.exec(line))) {
      var s = vectorFromRE(res);
      this._currentMat.specularR = s[0];
      this._currentMat.specularG = s[1];
      this._currentMat.specularB = s[2];
      this._currentMat.specularA = s[3];
    }
  }
  function parseMTL_m(line) {
    var res = /map_Kd\s+(.*)/.exec(line);
    if (res) {
      var path = res[1];
      path = path.replace(/\\/g, '/');
      var slashIndex = path.lastIndexOf('/');
      if (slashIndex >= 0) {
        path = path.substring(slashIndex + 1);
      }
      this._currentMat.texture = path;
    }
  }
  var s_matInit = {
    diffuseR: 1.0,
    diffuseG: 1.0,
    diffuseB: 1.0,
    diffuseA: 1.0,
    specularR: 1.0,
    specularG: 1.0,
    specularB: 1.0,
    specularA: 1.0,
    shininess: 0,
    lightEmission: 0,
    refractionAmount: 0,
    reflectionAmount: 0,
    textureOffsetX: 0,
    textureOffsetY: 0,
    textureScaleX: 1,
    textureScaleY: 1,
    lightmapOffsetX: 0,
    lightmapOffsetY: 0,
    lightmapScaleX: 1,
    lightmapScaleY: 1,
    normalMapOffsetX: 0,
    normalMapOffsetY: 0,
    normalMapScaleX: 1,
    normalMapScaleY: 1,
    alphaCutoff: 0.5,
    castShadows: true,
    receiveShadows: true,
    shininessMaskChannel: 0,
    shininessMaskInvert: false,
    lightEmissionMaskChannel: 0,
    lightEmissionMaskInvert: false,
    reflectionMaskChannel: 0,
    reflectionMaskInvert: false,
    cullFace: true,
    texture: "",
    lightmap: "",
    normalMap: "",
    shininessMask: "",
    lightEmissionMask: "",
    reflectionMask: ""
  };
  var MTLParser = function() {
    function MTLParser(mtlData) {
      var $__2 = this;
      this._jsonData = {};
      this._currentMat = JSON.parse(JSON.stringify(s_matInit));
      var lines = mtlData.split('\n');
      lines.forEach(function(line) {
        line = line.trim();
        if (line.length > 1 && line[0] != '#') {
          switch (line[0]) {
            case 'n':
              parseMTL_n.apply($__2, [line]);
              break;
            case 'N':
              parseMTL_N.apply($__2, [line]);
              break;
            case 'm':
              parseMTL_m.apply($__2, [line]);
              break;
            case 'd':
              break;
            case 'T':
              break;
            case 'K':
              parseMTL_K.apply($__2, [line]);
              break;
            case 'i':
              break;
            case 'o':
              break;
          }
        }
      });
    }
    return ($traceurRuntime.createClass)(MTLParser, {get jsonData() {
        return this._jsonData;
      }}, {});
  }();
  function parseM(line) {
    var res = /mtllib\s+(.*)/.exec(line);
    if (res) {
      this._mtlLib = res[1];
    }
  }
  function parseG(line) {
    var res = /g\s+(.*)/.exec(line);
    if (res) {
      this._currentPlist.name = res[1];
    }
  }
  function parseU(line) {
    var res = /usemtl\s+(.*)/.exec(line);
    if (res) {
      this._currentPlist._matName = res[1];
      if (this._currentPlist.name == "") {
        this._currentPlist.name = res[1];
      }
    }
  }
  function parseS(line) {
    var res = /s\s+(.*)/.exec(line);
    if (res) {}
  }
  function addPoint(pointData) {
    this._currentPlist.vertex.push(pointData.vertex[0], pointData.vertex[1], pointData.vertex[2]);
    if (pointData.normal) {
      this._currentPlist.normal.push(pointData.normal[0], pointData.normal[1], pointData.normal[2]);
    }
    if (pointData.tex) {
      this._currentPlist.texCoord0.push(pointData.tex[0], pointData.tex[1]);
    }
    this._currentPlist.index.push(this._currentPlist.index.length);
  }
  function addPolygon(polygonData) {
    var currentVertex = 0;
    var sides = polygonData.length;
    if (sides < 3)
      return;
    while (currentVertex < sides) {
      var i0 = currentVertex;
      var i1 = currentVertex + 1;
      var i2 = currentVertex + 2;
      if (i2 == sides) {
        i2 = 0;
      } else if (i1 == sides) {
        i1 = 0;
        i2 = 2;
      }
      var p0 = polygonData[i0];
      var p1 = polygonData[i1];
      var p2 = polygonData[i2];
      addPoint.apply(this, [p0]);
      addPoint.apply(this, [p1]);
      addPoint.apply(this, [p2]);
      currentVertex += 3;
    }
  }
  function parseF(line) {
    this._addPlist = true;
    var res = /f\s+(.*)/.exec(line);
    if (res) {
      var params = res[1];
      var vtnRE = /([\d\-]+)\/([\d\-]*)\/([\d\-]*)/g;
      if (params.indexOf('/') == -1) {
        var vRE = /([\d\-]+)/g;
      }
      var polygon = [];
      while ((res = vtnRE.exec(params))) {
        var iV = Number(res[1]);
        var iN = res[3] ? Number(res[3]) : null;
        var iT = res[2] ? Number(res[2]) : null;
        iV = iV < 0 ? this._vertexArray.length + iV : iV - 1;
        iN = iN < 0 ? this._normalArray.length + iN : (iN === null ? null : iN - 1);
        iT = iT < 0 ? this._texCoordArray.length + iT : (iT === null ? null : iT - 1);
        var v = this._vertexArray[iV];
        var n = iN !== null ? this._normalArray[iN] : null;
        var t = iT !== null ? this._texCoordArray[iT] : null;
        polygon.push({
          vertex: v,
          normal: n,
          tex: t
        });
      }
      addPolygon.apply(this, [polygon]);
    }
  }
  function parseO(line) {
    var res = /s\s+(.*)/.exec(line);
    if (res && this._currentPlist.name == "") {
      this._currentPlist.name = res[1];
    }
  }
  function checkAddPlist() {
    if (this._addPlist) {
      if (this._currentPlist) {
        this._currentPlist.build();
        this._plistArray.push(this._currentPlist);
      }
      this._currentPlist = new bg.base.PolyList(this.context);
      this._addPlist = false;
    }
  }
  function parseMTL(mtlData) {
    var parser = new MTLParser(mtlData);
    return parser.jsonData;
  }
  var OBJParser = function() {
    function OBJParser(context, url) {
      this.context = context;
      this.url = url;
      this._plistArray = [];
      this._vertexArray = [];
      this._normalArray = [];
      this._texCoordArray = [];
      this._mtlLib = "";
      this._addPlist = true;
    }
    return ($traceurRuntime.createClass)(OBJParser, {loadDrawable: function(data) {
        var $__2 = this;
        return new Promise(function(resolve, reject) {
          var drawable = new bg.scene.Drawable($__2.url);
          var lines = data.split('\n');
          lines.forEach(function(line) {
            line = line.trim();
            if (line.length > 1 && line[0] != '#') {
              switch (line[0]) {
                case 'v':
                  var res = /v\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)/.exec(line);
                  if (res) {
                    $__2._vertexArray.push([Number(res[1]), Number(res[2]), Number(res[3])]);
                  } else if ((res = /vn\s+([\d\.\-]+)\s+([\d\.\-]+)\s+([\d\.\-]+)/.exec(line))) {
                    $__2._normalArray.push([Number(res[1]), Number(res[2]), Number(res[3])]);
                  } else if ((res = /vt\s+([\d\.\-]+)\s+([\d\.\-]+)/.exec(line))) {
                    $__2._texCoordArray.push([Number(res[1]), Number(res[2])]);
                  }
                  break;
                case 'm':
                  checkAddPlist.apply($__2);
                  parseM.apply($__2, [line]);
                  break;
                case 'g':
                  checkAddPlist.apply($__2);
                  parseG.apply($__2, [line]);
                  break;
                case 'u':
                  checkAddPlist.apply($__2);
                  parseU.apply($__2, [line]);
                  break;
                case 's':
                  parseS.apply($__2, [line]);
                  break;
                case 'f':
                  parseF.apply($__2, [line]);
                  break;
                case 'o':
                  checkAddPlist.apply($__2);
                  parseO.apply($__2, [line]);
                  break;
              }
            }
          });
          if ($__2._currentPlist && $__2._addPlist) {
            $__2._currentPlist.build();
            $__2._plistArray.push($__2._currentPlist);
          }
          function buildDrawable(plistArray, materials) {
            var $__3 = this;
            plistArray.forEach(function(plist) {
              var mat = new bg.base.Material();
              var matData = materials[plist._matName];
              if (matData) {
                var url = $__3.url.substring(0, $__3.url.lastIndexOf('/') + 1);
                bg.base.Material.GetMaterialWithJson($__3.context, matData, url).then(function(material) {
                  drawable.addPolyList(plist, material);
                });
              } else {
                drawable.addPolyList(plist, mat);
              }
            });
          }
          if ($__2._mtlLib) {
            var locationUrl = $__2.url.substring(0, $__2.url.lastIndexOf("/"));
            if (locationUrl.length > 0 && locationUrl != '/')
              locationUrl += "/";
            bg.utils.Resource.Load(locationUrl + $__2._mtlLib).then(function(data) {
              buildDrawable.apply($__2, [$__2._plistArray, parseMTL(data)]);
              resolve(drawable);
            }).catch(function() {
              bg.log("Warning: no such material library file for obj model " + $__2.url);
              buildDrawable.apply($__2, [$__2._plistArray, {}]);
              resolve(drawable);
            });
          } else {
            buildDrawable.apply($__2, [$__2._plistArray]);
            resolve(drawable);
          }
        });
      }}, {});
  }();
  var OBJLoaderPlugin = function($__super) {
    function OBJLoaderPlugin() {
      $traceurRuntime.superConstructor(OBJLoaderPlugin).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(OBJLoaderPlugin, {
      acceptType: function(url, data) {
        return bg.utils.Resource.GetExtension(url) == "obj";
      },
      load: function(context, url, data) {
        return new Promise(function(resolve, reject) {
          if (data) {
            try {
              var parser = new OBJParser(context, url);
              var resultNode = null;
              var basePath = url.split("/");
              basePath.pop();
              basePath = basePath.join("/") + '/';
              var matUrl = url.split(".");
              matUrl.pop();
              matUrl.push("bg2mat");
              matUrl = matUrl.join(".");
              parser.loadDrawable(data).then(function(drawable) {
                var node = new bg.scene.Node(context, drawable.name);
                node.addComponent(drawable);
                resultNode = node;
                return bg.utils.Resource.LoadJson(matUrl);
              }).then(function(matData) {
                var promises = [];
                try {
                  var drw = resultNode.component("bg.scene.Drawable");
                  drw.forEach(function(plist, mat) {
                    var matDef = null;
                    matData.some(function(defItem) {
                      if (defItem.name == plist.name) {
                        matDef = defItem;
                        return true;
                      }
                    });
                    if (matDef) {
                      var p = bg.base.Material.FromMaterialDefinition(context, matDef, basePath);
                      promises.push(p);
                      p.then(function(newMat) {
                        mat.assign(newMat);
                      });
                    }
                  });
                } catch (err) {}
                return Promise.all(promises);
              }).then(function() {
                resolve(resultNode);
              }).catch(function() {
                resolve(resultNode);
              });
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error("Error loading drawable. Data is null."));
          }
        });
      }
    }, {}, $__super);
  }(bg.base.LoaderPlugin);
  bg.base.OBJLoaderPlugin = OBJLoaderPlugin;
})();

"use strict";
(function() {
  function createCube(context, w, h, d) {
    var plist = new bg.base.PolyList(context);
    var x = w / 2;
    var y = h / 2;
    var z = d / 2;
    plist.vertex = [x, -y, -z, -x, -y, -z, -x, y, -z, x, y, -z, x, -y, z, x, -y, -z, x, y, -z, x, y, z, -x, -y, z, x, -y, z, x, y, z, -x, y, z, -x, -y, -z, -x, -y, z, -x, y, z, -x, y, -z, -x, y, z, x, y, z, x, y, -z, -x, y, -z, x, -y, z, -x, -y, z, -x, -y, -z, x, -y, -z];
    plist.normal = [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0];
    plist.texCoord0 = [0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1];
    plist.texCoord1 = [0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1];
    plist.index = [0, 1, 2, 2, 3, 0, 4, 5, 6, 6, 7, 4, 8, 9, 10, 10, 11, 8, 12, 13, 14, 14, 15, 12, 16, 17, 18, 18, 19, 16, 20, 21, 22, 22, 23, 20];
    plist.build();
    return plist;
  }
  function createPlane(context, w, d) {
    var plane = arguments[3] !== (void 0) ? arguments[3] : 'y';
    var x = w / 2.0;
    var y = d / 2.0;
    var plist = new bg.base.PolyList(context);
    switch (plane.toLowerCase()) {
      case 'x':
        plist.vertex = [0.000000, -x, -y, 0.000000, x, -y, 0.000000, x, y, 0.000000, x, y, 0.000000, -x, y, 0.000000, -x, -y];
        break;
      case 'y':
        plist.vertex = [-x, 0.000000, -y, x, 0.000000, -y, x, 0.000000, y, x, 0.000000, y, -x, 0.000000, y, -x, 0.000000, -y];
        break;
      case 'z':
        plist.vertex = [-x, -y, 0.000000, x, -y, 0.000000, x, y, 0.000000, x, y, 0.000000, -x, y, 0.000000, -x, -y, 0.000000];
        break;
    }
    plist.normal = [0.000000, 1.000000, 0.000000, 0.000000, 1.000000, 0.000000, 0.000000, 1.000000, 0.000000, 0.000000, 1.000000, 0.000000, 0.000000, 1.000000, 0.000000, 0.000000, 1.000000, 0.000000];
    plist.texCoord0 = [0.000000, 0.000000, 1.000000, 0.000000, 1.000000, 1.000000, 1.000000, 1.000000, 0.000000, 1.000000, 0.000000, 0.000000];
    plist.texCoord1 = [0.000000, 0.000000, 1.000000, 0.000000, 1.000000, 1.000000, 1.000000, 1.000000, 0.000000, 1.000000, 0.000000, 0.000000];
    plist.index = [2, 1, 0, 5, 4, 3];
    plist.build();
    return plist;
  }
  function createSphere(context, radius, slices, stacks) {
    var plist = new bg.base.PolyList(context);
    ++slices;
    var R = 1 / (stacks - 1);
    var S = 1 / (slices - 1);
    var r,
        s;
    var vertex = [];
    var normal = [];
    var texCoord = [];
    var index = [];
    for (r = 0; r < stacks; r++)
      for (s = 0; s < slices; s++) {
        var y = bg.Math.sin(-bg.Math.PI_2 + bg.Math.PI * r * R);
        var x = bg.Math.cos(2 * bg.Math.PI * s * S) * bg.Math.sin(bg.Math.PI * r * R);
        var z = bg.Math.sin(2 * bg.Math.PI * s * S) * bg.Math.sin(bg.Math.PI * r * R);
        texCoord.push(s * S);
        texCoord.push(r * R);
        normal.push(x, y, z);
        vertex.push(x * radius, y * radius, z * radius);
      }
    for (r = 0; r < stacks - 1; r++)
      for (s = 0; s < slices - 1; s++) {
        var i1 = r * slices + s;
        var i2 = r * slices + (s + 1);
        var i3 = (r + 1) * slices + (s + 1);
        var i4 = (r + 1) * slices + s;
        index.push(i1);
        index.push(i4);
        index.push(i3);
        index.push(i3);
        index.push(i2);
        index.push(i1);
      }
    plist.vertex = vertex;
    plist.normal = normal;
    plist.texCoord0 = texCoord;
    plist.texCoord1 = texCoord;
    plist.index = index;
    plist.build();
    return plist;
  }
  function createDrawable(plist, name) {
    var drawable = new bg.scene.Drawable(name);
    drawable.addPolyList(plist);
    return drawable;
  }
  var PrimitiveFactory = function() {
    function PrimitiveFactory() {}
    return ($traceurRuntime.createClass)(PrimitiveFactory, {}, {
      CubePolyList: function(context) {
        var w = arguments[1] !== (void 0) ? arguments[1] : 1;
        var h = arguments[2];
        var d = arguments[3];
        h = h || w;
        d = d || w;
        return createCube(context, w, h, d);
      },
      PlanePolyList: function(context) {
        var w = arguments[1] !== (void 0) ? arguments[1] : 1;
        var d = arguments[2];
        var plane = arguments[3] !== (void 0) ? arguments[3] : 'y';
        d = d || w;
        return createPlane(context, w, d, plane);
      },
      SpherePolyList: function(context) {
        var r = arguments[1] !== (void 0) ? arguments[1] : 1;
        var slices = arguments[2] !== (void 0) ? arguments[2] : 20;
        var stacks = arguments[3];
        stacks = stacks || slices;
        return createSphere(context, r, slices, stacks);
      },
      Cube: function(context) {
        var w = arguments[1] !== (void 0) ? arguments[1] : 1;
        var h = arguments[2];
        var d = arguments[3];
        h = h || w;
        d = d || w;
        return createDrawable(createCube(context, w, h, d), "Cube");
      },
      Plane: function(context) {
        var w = arguments[1] !== (void 0) ? arguments[1] : 1;
        var d = arguments[2];
        var plane = arguments[3] !== (void 0) ? arguments[3] : 'y';
        d = d || w;
        return createDrawable(createPlane(context, w, d, plane), "Plane");
      },
      Sphere: function(context) {
        var r = arguments[1] !== (void 0) ? arguments[1] : 1;
        var slices = arguments[2] !== (void 0) ? arguments[2] : 20;
        var stacks = arguments[3];
        stacks = stacks || slices;
        return createDrawable(createSphere(context, r, slices, stacks), "Sphere");
      }
    });
  }();
  bg.scene.PrimitiveFactory = PrimitiveFactory;
})();

"use strict";
(function() {
  function fooScene(context) {
    var root = new bg.scene.Node(context, "Scene Root");
    bg.base.Loader.Load(context, "../data/test-shape.vwglb").then(function(node) {
      root.addChild(node);
      node.addComponent(new bg.scene.Transform(bg.Matrix4.Translation(-1.4, 0.25, 0).scale(0.5, 0.5, 0.5)));
    }).catch(function(err) {
      alert(err.message);
    });
    var sphereNode = new bg.scene.Node(context, "Sphere");
    sphereNode.addComponent(new bg.scene.Transform(bg.Matrix4.Translation(-1.3, 0.1, 1.3)));
    sphereNode.addComponent(bg.scene.PrimitiveFactory.Sphere(context, 0.1));
    sphereNode.component("bg.scene.Drawable").getMaterial(0).diffuse.a = 0.8;
    sphereNode.component("bg.scene.Drawable").getMaterial(0).reflectionAmount = 0.4;
    root.addChild(sphereNode);
    var floorNode = new bg.scene.Node(context, "Floor");
    floorNode.addComponent(new bg.scene.Transform(bg.Matrix4.Translation(0, 0, 0)));
    floorNode.addComponent(bg.scene.PrimitiveFactory.Plane(context, 10, 10));
    floorNode.component("bg.scene.Drawable").getMaterial(0).shininess = 50;
    floorNode.component("bg.scene.Drawable").getMaterial(0).reflectionAmount = 0.3;
    floorNode.component("bg.scene.Drawable").getMaterial(0).normalMapScale = new bg.Vector2(10, 10);
    floorNode.component("bg.scene.Drawable").getMaterial(0).textureScale = new bg.Vector2(10, 10);
    floorNode.component("bg.scene.Drawable").getMaterial(0).reflectionMaskInvert = true;
    floorNode.component("bg.scene.Drawable").getMaterial(0).shininessMaskInvert = true;
    root.addChild(floorNode);
    bg.base.Loader.Load(context, "../data/bricks_nm.png").then(function(tex) {
      floorNode.component("bg.scene.Drawable").getMaterial(0).normalMap = tex;
    });
    bg.base.Loader.Load(context, "../data/bricks.jpg").then(function(tex) {
      floorNode.component("bg.scene.Drawable").getMaterial(0).texture = tex;
    });
    bg.base.Loader.Load(context, "../data/bricks_shin.jpg").then(function(tex) {
      floorNode.component("bg.scene.Drawable").getMaterial(0).reflectionMask = tex;
      floorNode.component("bg.scene.Drawable").getMaterial(0).shininessMask = tex;
    });
    var lightNode = new bg.scene.Node(context, "Light");
    lightNode.addComponent(new bg.scene.Light(new bg.base.Light(context)));
    lightNode.addComponent(new bg.scene.Transform(bg.Matrix4.Identity().rotate(bg.Math.degreesToRadians(30), 0, 1, 0).rotate(bg.Math.degreesToRadians(35), -1, 0, 0)));
    root.addChild(lightNode);
    var camera = new bg.scene.Camera();
    camera.isMain = true;
    var cameraNode = new bg.scene.Node("Camera");
    cameraNode.addComponent(camera);
    cameraNode.addComponent(new bg.scene.Transform());
    cameraNode.addComponent(new bg.manipulation.OrbitCameraController());
    var camCtrl = cameraNode.component("bg.manipulation.OrbitCameraController");
    camCtrl.minPitch = -45;
    root.addChild(cameraNode);
    return root;
  }
  var SceneFileParser = function() {
    function SceneFileParser(url, jsonData) {
      this.url = url.substring(0, url.lastIndexOf('/'));
      this.jsonData = jsonData;
    }
    return ($traceurRuntime.createClass)(SceneFileParser, {
      loadNode: function(context, jsonData, parent, promises) {
        var $__2 = this;
        var node = new bg.scene.Node(context, jsonData.name);
        node.enabled = jsonData.enabled;
        parent.addChild(node);
        jsonData.components.forEach(function(compData) {
          promises.push(bg.scene.Component.Factory(context, compData, node, $__2.url));
        });
        jsonData.children.forEach(function(child) {
          $__2.loadNode(context, child, node, promises);
        });
      },
      loadScene: function(context) {
        var $__2 = this;
        var promises = [];
        var sceneRoot = new bg.scene.Node(context, "scene-root");
        this.jsonData.scene.forEach(function(nodeData) {
          $__2.loadNode(context, nodeData, sceneRoot, promises);
        });
        return new Promise(function(resolve, reject) {
          Promise.all(promises).then(function() {
            var findVisitor = new bg.scene.FindComponentVisitor("bg.scene.Camera");
            sceneRoot.accept(findVisitor);
            var cameraNode = null;
            var firstCamera = null;
            findVisitor.result.some(function(cn) {
              if (!firstCamera) {
                firstCamera = cn;
              }
              if (cn.camera.isMain) {
                cameraNode = cn;
                return true;
              }
            });
            cameraNode = cameraNode || firstCamera;
            if (!cameraNode) {
              cameraNode = new bg.scene.Node(context, "Camera");
              cameraNode.addComponent(new bg.scene.Camera());
              var trx = bg.Matrix4.Rotation(0.52, -1, 0, 0);
              trx.translate(0, 0, 5);
              cameraNode.addComponent(new bg.scene.Transform(trx));
              sceneRoot.addChild(cameraNode);
            }
            bg.scene.Camera.SetAsMainCamera(cameraNode, sceneRoot);
            resolve({
              sceneRoot: sceneRoot,
              cameraNode: cameraNode
            });
          });
        });
      }
    }, {});
  }();
  var SceneLoaderPlugin = function($__super) {
    function SceneLoaderPlugin() {
      $traceurRuntime.superConstructor(SceneLoaderPlugin).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(SceneLoaderPlugin, {
      acceptType: function(url, data) {
        var ext = bg.utils.Resource.GetExtension(url);
        return ext == "vitscnj";
      },
      load: function(context, url, data) {
        return new Promise(function(resolve, reject) {
          if (data) {
            try {
              if (typeof(data) == "string") {
                data = data.replace(/,[\s\r\n]*\]/g, ']');
                data = data.replace(/,[\s\r\n]*\}/g, '}');
                data = JSON.parse(data);
              }
              var parser = new SceneFileParser(url, data);
              parser.loadScene(context).then(function(result) {
                resolve(result);
              });
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error("Error loading scene. Data is null"));
          }
        });
      }
    }, {}, $__super);
  }(bg.base.LoaderPlugin);
  bg.base.SceneLoaderPlugin = SceneLoaderPlugin;
})();

"use strict";
(function() {
  function copyCubemapImage(componentData, cubemapImage, dstPath) {
    var path = require("path");
    var src = bg.base.Writer.StandarizePath(this.getImageUrl(cubemapImage));
    var file = src.split('/').pop();
    var dst = bg.base.Writer.StandarizePath(path.join(dstPath, file));
    switch (cubemapImage) {
      case bg.scene.CubemapImage.POSITIVE_X:
        componentData.positiveX = file;
        break;
      case bg.scene.CubemapImage.NEGATIVE_X:
        componentData.negativeX = file;
        break;
      case bg.scene.CubemapImage.POSITIVE_Y:
        componentData.positiveY = file;
        break;
      case bg.scene.CubemapImage.NEGATIVE_Y:
        componentData.negativeY = file;
        break;
      case bg.scene.CubemapImage.POSITIVE_Z:
        componentData.positiveZ = file;
        break;
      case bg.scene.CubemapImage.NEGATIVE_Z:
        componentData.negativeZ = file;
        break;
    }
    return bg.base.Writer.CopyFile(src, dst);
  }
  var g_backFace = [0.5, -0.5, -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5];
  var g_rightFace = [0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5];
  var g_frontFace = [-0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5];
  var g_leftFace = [-0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5];
  var g_topFace = [-0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5];
  var g_bottomFace = [0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5];
  var g_backFaceNorm = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
  var g_rightFaceNorm = [-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0];
  var g_frontFaceNorm = [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1];
  var g_leftFaceNorm = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0];
  var g_topFaceNorm = [0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0];
  var g_bottomFaceNorm = [0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0];
  var uv0 = 0;
  var uv1 = 1;
  var g_backFaceUV = [uv1, uv0, uv0, uv0, uv0, uv1, uv1, uv1];
  var g_rightFaceUV = [uv1, uv0, uv0, uv0, uv0, uv1, uv1, uv1];
  var g_frontFaceUV = [uv1, uv0, uv0, uv0, uv0, uv1, uv1, uv1];
  var g_leftFaceUV = [uv1, uv0, uv0, uv0, uv0, uv1, uv1, uv1];
  var g_topFaceUV = [uv1, uv0, uv0, uv0, uv0, uv1, uv1, uv1];
  var g_bottomFaceUV = [uv1, uv0, uv0, uv0, uv0, uv1, uv1, uv1];
  var g_index = [2, 1, 0, 0, 3, 2];
  var Skybox = function($__super) {
    function Skybox() {
      $traceurRuntime.superConstructor(Skybox).call(this);
      this._images = [null, null, null, null, null, null];
      this._textures = [];
      this._plist = [];
      this._material = null;
    }
    return ($traceurRuntime.createClass)(Skybox, {
      setImageUrl: function(imgCode, texture) {
        this._images[imgCode] = texture;
      },
      getImageUrl: function(imgCode) {
        return this._images[imgCode];
      },
      getTexture: function(imgCode) {
        return this._textures[imgCode];
      },
      loadSkybox: function() {
        var context = arguments[0] !== (void 0) ? arguments[0] : null;
        var onProgress = arguments[1] !== (void 0) ? arguments[1] : null;
        var $__2 = this;
        context = context || this.node && this.node.context;
        var backPlist = new bg.base.PolyList(context);
        var rightPlist = new bg.base.PolyList(context);
        var frontPlist = new bg.base.PolyList(context);
        var leftPlist = new bg.base.PolyList(context);
        var topPlist = new bg.base.PolyList(context);
        var bottomPlist = new bg.base.PolyList(context);
        backPlist.vertex = g_backFace;
        backPlist.normal = g_backFaceNorm;
        backPlist.texCoord0 = g_backFaceUV;
        backPlist.texCoord1 = g_backFaceUV;
        backPlist.index = g_index;
        backPlist.build();
        rightPlist.vertex = g_rightFace;
        rightPlist.normal = g_rightFaceNorm;
        rightPlist.texCoord0 = g_rightFaceUV;
        rightPlist.texCoord1 = g_rightFaceUV;
        rightPlist.index = g_index;
        rightPlist.build();
        frontPlist.vertex = g_frontFace;
        frontPlist.normal = g_frontFaceNorm;
        frontPlist.texCoord0 = g_frontFaceUV;
        frontPlist.texCoord1 = g_frontFaceUV;
        frontPlist.index = g_index;
        frontPlist.build();
        leftPlist.vertex = g_leftFace;
        leftPlist.normal = g_leftFaceNorm;
        leftPlist.texCoord0 = g_leftFaceUV;
        leftPlist.texCoord1 = g_leftFaceUV;
        leftPlist.index = g_index;
        leftPlist.build();
        topPlist.vertex = g_topFace;
        topPlist.normal = g_topFaceNorm;
        topPlist.texCoord0 = g_topFaceUV;
        topPlist.texCoord1 = g_topFaceUV;
        topPlist.index = g_index;
        topPlist.build();
        bottomPlist.vertex = g_bottomFace;
        bottomPlist.normal = g_bottomFaceNorm;
        bottomPlist.texCoord0 = g_bottomFaceUV;
        bottomPlist.texCoord1 = g_bottomFaceUV;
        bottomPlist.index = g_index;
        bottomPlist.build();
        this._plist = [leftPlist, rightPlist, topPlist, bottomPlist, frontPlist, backPlist];
        this._material = new bg.base.Material();
        this._material.receiveShadows = false;
        this._material.castShadows = false;
        this._material.unlit = true;
        return new Promise(function(resolve, reject) {
          bg.base.Loader.Load(context, $__2._images, onProgress, {
            wrapX: bg.base.TextureWrap.MIRRORED_REPEAT,
            wrapY: bg.base.TextureWrap.MIRRORED_REPEAT
          }).then(function(result) {
            $__2._textures = [result[$__2.getImageUrl(bg.scene.CubemapImage.POSITIVE_X)], result[$__2.getImageUrl(bg.scene.CubemapImage.NEGATIVE_X)], result[$__2.getImageUrl(bg.scene.CubemapImage.POSITIVE_Y)], result[$__2.getImageUrl(bg.scene.CubemapImage.NEGATIVE_Y)], result[$__2.getImageUrl(bg.scene.CubemapImage.POSITIVE_Z)], result[$__2.getImageUrl(bg.scene.CubemapImage.NEGATIVE_Z)]];
            $__2._textures.forEach(function(tex) {
              tex.wrapX = bg.base.TextureWrap.CLAMP;
              tex.wrapY = bg.base.TextureWrap.CLAMP;
            });
            bg.emitImageLoadEvent(result[$__2.getImageUrl(bg.scene.CubemapImage.POSITIVE_X)]);
            resolve();
          }).catch(function(err) {
            reject(err);
          });
        });
      },
      display: function(pipeline, matrixState) {
        var $__2 = this;
        if (!pipeline.effect) {
          throw new Error("Could not draw skybox: invalid effect");
        }
        if (!this.node.enabled) {
          return;
        } else if (this._textures.length == 6) {
          var curMaterial = pipeline.effect.material;
          pipeline.effect.material = this._material;
          matrixState.viewMatrixStack.push();
          matrixState.modelMatrixStack.push();
          matrixState.viewMatrixStack.matrix.setPosition(0, 0, 0);
          var projectionMatrix = matrixState.projectionMatrixStack.matrix;
          var m22 = -projectionMatrix.m22;
          var m32 = -projectionMatrix.m32;
          var far = (2.0 * m32) / (2.0 * m22 - 2.0);
          var offset = 1;
          var scale = bg.Math.sin(bg.Math.PI_4) * far - offset;
          matrixState.modelMatrixStack.scale(scale, scale, scale);
          if (pipeline.shouldDraw(this._material)) {
            this._plist.forEach(function(pl, index) {
              $__2._material.texture = $__2._textures[index];
              pipeline.draw(pl);
            });
          }
          matrixState.modelMatrixStack.pop();
          matrixState.viewMatrixStack.pop();
          pipeline.effect.material = curMaterial;
        }
      },
      removedFromNode: function() {
        this._plist.forEach(function(pl) {
          pl.destroy();
        });
      },
      deserialize: function(context, sceneData, url) {
        this.setImageUrl(bg.scene.CubemapImage.POSITIVE_X, bg.utils.Resource.JoinUrl(url, sceneData["positiveX"]));
        this.setImageUrl(bg.scene.CubemapImage.NEGATIVE_X, bg.utils.Resource.JoinUrl(url, sceneData["negativeX"]));
        this.setImageUrl(bg.scene.CubemapImage.POSITIVE_Y, bg.utils.Resource.JoinUrl(url, sceneData["positiveY"]));
        this.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Y, bg.utils.Resource.JoinUrl(url, sceneData["negativeY"]));
        this.setImageUrl(bg.scene.CubemapImage.POSITIVE_Z, bg.utils.Resource.JoinUrl(url, sceneData["positiveZ"]));
        this.setImageUrl(bg.scene.CubemapImage.NEGATIVE_Z, bg.utils.Resource.JoinUrl(url, sceneData["negativeZ"]));
        return this.loadSkybox(context);
      },
      serialize: function(componentData, promises, url) {
        $traceurRuntime.superGet(this, Skybox.prototype, "serialize").call(this, componentData, promises, url);
        if (!bg.isElectronApp)
          return;
        promises.push(copyCubemapImage.apply(this, [componentData, bg.scene.CubemapImage.POSITIVE_X, url.path]));
        promises.push(copyCubemapImage.apply(this, [componentData, bg.scene.CubemapImage.NEGATIVE_X, url.path]));
        promises.push(copyCubemapImage.apply(this, [componentData, bg.scene.CubemapImage.POSITIVE_Y, url.path]));
        promises.push(copyCubemapImage.apply(this, [componentData, bg.scene.CubemapImage.NEGATIVE_Y, url.path]));
        promises.push(copyCubemapImage.apply(this, [componentData, bg.scene.CubemapImage.POSITIVE_Z, url.path]));
        promises.push(copyCubemapImage.apply(this, [componentData, bg.scene.CubemapImage.NEGATIVE_Z, url.path]));
      }
    }, {}, $__super);
  }(bg.scene.Component);
  bg.scene.registerComponent(bg.scene, Skybox, "bg.scene.Skybox");
})();

"use strict";
(function() {
  var Transform = function($__super) {
    function Transform(matrix) {
      $traceurRuntime.superConstructor(Transform).call(this);
      this._matrix = matrix || bg.Matrix4.Identity();
      this._globalMatrixValid = false;
      this._transformVisitor = new bg.scene.TransformVisitor();
    }
    return ($traceurRuntime.createClass)(Transform, {
      clone: function() {
        var newTrx = new bg.scene.Transform();
        newTrx.matrix = new bg.Matrix4(this.matrix);
        return newTrx;
      },
      get matrix() {
        return this._matrix;
      },
      set matrix(m) {
        this._matrix = m;
      },
      get globalMatrix() {
        if (!this._globalMatrixValid) {
          this._transformVisitor.clear();
          this.node.acceptReverse(this._transformVisitor);
          this._globalMatrix = this._transformVisitor.matrix;
        }
        return this._globalMatrix;
      },
      deserialize: function(context, sceneData, url) {
        var $__1 = this;
        return new Promise(function(resolve, reject) {
          if (sceneData.transformStrategy) {
            var str = sceneData.transformStrategy;
            if (str.type == "TRSTransformStrategy") {
              $__1._matrix.identity().translate(str.translate[0], str.translate[1], str.translate[2]);
              switch (str.rotationOrder) {
                case "kOrderXYZ":
                  $__1._matrix.rotate(str.rotateX, 1, 0, 0).rotate(str.rotateY, 0, 1, 0).rotate(str.rotateZ, 0, 0, 1);
                  break;
                case "kOrderXZY":
                  $__1._matrix.rotate(str.rotateX, 1, 0, 0).rotate(str.rotateZ, 0, 0, 1).rotate(str.rotateY, 0, 1, 0);
                  break;
                case "kOrderYXZ":
                  $__1._matrix.rotate(str.rotateY, 0, 1, 0).rotate(str.rotateX, 1, 0, 0).rotate(str.rotateZ, 0, 0, 1);
                  break;
                case "kOrderYZX":
                  $__1._matrix.rotate(str.rotateY, 0, 1, 0).rotate(str.rotateZ, 0, 0, 1).rotate(str.rotateX, 1, 0, 0);
                  break;
                case "kOrderZYX":
                  $__1._matrix.rotate(str.rotateZ, 0, 0, 1).rotate(str.rotateY, 0, 1, 0).rotate(str.rotateX, 1, 0, 0);
                  break;
                case "kOrderZXY":
                  $__1._matrix.rotate(str.rotateZ, 0, 0, 1).rotate(str.rotateX, 1, 0, 0).rotate(str.rotateY, 0, 1, 0);
                  break;
              }
              $__1._matrix.scale(str.scale[0], str.scale[1], str.scale[2]);
            }
          } else if (sceneData.transformMatrix) {
            $__1._matrix = new bg.Matrix4(sceneData.transformMatrix);
          }
          resolve($__1);
        });
      },
      serialize: function(componentData, promises, url) {
        $traceurRuntime.superGet(this, Transform.prototype, "serialize").call(this, componentData, promises, url);
        componentData.transformMatrix = this._matrix.toArray();
      },
      willDisplay: function(pipeline, matrixState) {
        if (this.node && this.node.enabled) {
          matrixState.modelMatrixStack.push();
          matrixState.modelMatrixStack.mult(this.matrix);
        }
      },
      didDisplay: function(pipeline, matrixState) {
        if (this.node && this.node.enabled) {
          matrixState.modelMatrixStack.pop();
        }
        this._globalMatrixValid = false;
      }
    }, {}, $__super);
  }(bg.scene.Component);
  bg.scene.registerComponent(bg.scene, Transform, "bg.scene.Transform");
})();

"use strict";
(function() {
  var DrawVisitor = function($__super) {
    function DrawVisitor(pipeline, matrixState) {
      $traceurRuntime.superConstructor(DrawVisitor).call(this);
      this._pipeline = pipeline || bg.base.Pipeline.Current();
      this._matrixState = matrixState || bg.base.MatrixState.Current();
    }
    return ($traceurRuntime.createClass)(DrawVisitor, {
      get pipeline() {
        return this._pipeline;
      },
      get matrixState() {
        return this._matrixState;
      },
      visit: function(node) {
        node.willDisplay(this.pipeline, this.matrixState);
        node.display(this.pipeline, this.matrixState);
      },
      didVisit: function(node) {
        node.didDisplay(this.pipeline, this.matrixState);
      }
    }, {}, $__super);
  }(bg.scene.NodeVisitor);
  bg.scene.DrawVisitor = DrawVisitor;
  var FrameVisitor = function($__super) {
    function FrameVisitor() {
      $traceurRuntime.superConstructor(FrameVisitor).call(this);
      this._delta = 0;
    }
    return ($traceurRuntime.createClass)(FrameVisitor, {
      get delta() {
        return this._delta;
      },
      set delta(d) {
        this._delta = d;
      },
      visit: function(node) {
        node.frame(this.delta);
      }
    }, {}, $__super);
  }(bg.scene.NodeVisitor);
  bg.scene.FrameVisitor = FrameVisitor;
  var TransformVisitor = function($__super) {
    function TransformVisitor() {
      $traceurRuntime.superConstructor(TransformVisitor).call(this);
      this._matrix = bg.Matrix4.Identity();
    }
    return ($traceurRuntime.createClass)(TransformVisitor, {
      get matrix() {
        return this._matrix;
      },
      clear: function() {
        this._matrix = bg.Matrix4.Identity();
      },
      visit: function(node) {
        var trx = node.component("bg.scene.Transform");
        if (trx) {
          this._matrix.mult(trx.matrix);
        }
      }
    }, {}, $__super);
  }(bg.scene.NodeVisitor);
  bg.scene.TransformVisitor = TransformVisitor;
  var InputVisitor = function($__super) {
    function InputVisitor() {
      $traceurRuntime.superConstructor(InputVisitor).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(InputVisitor, {
      visit: function(node) {
        if (this._operation) {
          node[this._operation](this._event);
        }
      },
      keyDown: function(scene, evt) {
        this._operation = "keyDown";
        this._event = evt;
        scene.accept(this);
      },
      keyUp: function(scene, evt) {
        this._operation = "keyUp";
        this._event = evt;
        scene.accept(this);
      },
      mouseUp: function(scene, evt) {
        this._operation = "mouseUp";
        this._event = evt;
        scene.accept(this);
      },
      mouseDown: function(scene, evt) {
        this._operation = "mouseDown";
        this._event = evt;
        scene.accept(this);
      },
      mouseMove: function(scene, evt) {
        this._operation = "mouseMove";
        this._event = evt;
        scene.accept(this);
      },
      mouseOut: function(scene, evt) {
        this._operation = "mouseOut";
        this._event = evt;
        scene.accept(this);
      },
      mouseDrag: function(scene, evt) {
        this._operation = "mouseDrag";
        this._event = evt;
        scene.accept(this);
      },
      mouseWheel: function(scene, evt) {
        this._operation = "mouseWheel";
        this._event = evt;
        scene.accept(this);
      },
      touchStart: function(scene, evt) {
        this._operation = "touchStart";
        this._event = evt;
        scene.accept(this);
      },
      touchMove: function(scene, evt) {
        this._operation = "touchMove";
        this._event = evt;
        scene.accept(this);
      },
      touchEnd: function(scene, evt) {
        this._operation = "touchEnd";
        this._event = evt;
        scene.accept(this);
      }
    }, {}, $__super);
  }(bg.scene.NodeVisitor);
  bg.scene.InputVisitor = InputVisitor;
  var BoundingBoxVisitor = function($__super) {
    function BoundingBoxVisitor() {
      $traceurRuntime.superConstructor(BoundingBoxVisitor).call(this);
      this.clear();
    }
    return ($traceurRuntime.createClass)(BoundingBoxVisitor, {
      get min() {
        return this._min;
      },
      get max() {
        return this._max;
      },
      get size() {
        return this._size;
      },
      clear: function() {
        this._min = new bg.Vector3(bg.Math.FLOAT_MAX, bg.Math.FLOAT_MAX, bg.Math.FLOAT_MAX);
        this._max = new bg.Vector3(-bg.Math.FLOAT_MAX, -bg.Math.FLOAT_MAX, -bg.Math.FLOAT_MAX);
        this._size = new bg.Vector3(0, 0, 0);
      },
      visit: function(node) {
        var trx = bg.Matrix4.Identity();
        if (node.component("bg.scene.Transform")) {
          trx = node.component("bg.scene.Transform").globalMatrix;
        }
        if (node.component("bg.scene.Drawable")) {
          var bb = new bg.tools.BoundingBox(node.component("bg.scene.Drawable"), new bg.Matrix4(trx));
          this._min = bg.Vector.MinComponents(this._min, bb.min);
          this._max = bg.Vector.MaxComponents(this._max, bb.max);
          this._size = bg.Vector3.Sub(this._max, this._min);
        }
      }
    }, {}, $__super);
  }(bg.scene.NodeVisitor);
  bg.scene.BoundingBoxVisitor = BoundingBoxVisitor;
  var FindComponentVisitor = function($__super) {
    function FindComponentVisitor(componentId) {
      $traceurRuntime.superConstructor(FindComponentVisitor).call(this);
      this.componentId = componentId;
      this.clear();
    }
    return ($traceurRuntime.createClass)(FindComponentVisitor, {
      get result() {
        return this._result;
      },
      clear: function() {
        this._result = [];
      },
      visit: function(node) {
        if (node.component(this.componentId)) {
          this._result.push(node);
        }
      }
    }, {}, $__super);
  }(bg.scene.NodeVisitor);
  bg.scene.FindComponentVisitor = FindComponentVisitor;
})();

"use strict";
(function() {
  function readBlock(arrayBuffer, offset) {
    var block = new Uint8Array(arrayBuffer, offset, 4);
    block = String.fromCharCode(block[0]) + String.fromCharCode(block[1]) + String.fromCharCode(block[2]) + String.fromCharCode(block[3]);
    return block;
  }
  function readInt(arrayBuffer, offset) {
    var dataView = new DataView(arrayBuffer, offset, 4);
    return dataView.getInt32(0);
  }
  function readFloat(arrayBuffer, offset) {
    var dataView = new DataView(arrayBuffer, offset, 4);
    return dataView.getFloat32(0);
  }
  function readMatrix4(arrayBuffer, offset) {
    var response = {
      offset: 0,
      data: []
    };
    var size = 16;
    var dataView = new DataView(arrayBuffer, offset, size * 4);
    var littleEndian = false;
    for (var i = 0; i < size; ++i) {
      response.data[i] = dataView.getFloat32(i * 4, littleEndian);
    }
    response.offset += size * 4;
    return response;
  }
  function readString(arrayBuffer, offset) {
    var response = {
      offset: 0,
      data: ""
    };
    var size = readInt(arrayBuffer, offset);
    response.offset += 4;
    var strBuffer = new Uint8Array(arrayBuffer, offset + 4, size);
    for (var i = 0; i < size; ++i) {
      response.data += String.fromCharCode(strBuffer[i]);
    }
    response.offset += size;
    return response;
  }
  function readFloatArray(arrayBuffer, offset) {
    var response = {
      offset: 0,
      data: []
    };
    var size = readInt(arrayBuffer, offset);
    response.offset += 4;
    var dataView = new DataView(arrayBuffer, offset + 4, size * 4);
    var littleEndian = false;
    for (var i = 0; i < size; ++i) {
      response.data[i] = dataView.getFloat32(i * 4, littleEndian);
    }
    response.offset += size * 4;
    return response;
  }
  function readIndexArray(arrayBuffer, offset) {
    var response = {
      offset: 0,
      data: []
    };
    var size = readInt(arrayBuffer, offset);
    response.offset += 4;
    var dataView = new DataView(arrayBuffer, offset + 4, size * 4);
    var littleEndian = false;
    for (var i = 0; i < size; ++i) {
      response.data[i] = dataView.getInt32(i * 4, littleEndian);
    }
    response.offset += size * 4;
    return response;
  }
  function addJoint(node, type, jointData) {
    var joint = new bg.physics[jointData.type]();
    joint.offset = new (Function.prototype.bind.apply(bg.Vector3, $traceurRuntime.spread([null], jointData.offset)))();
    joint.roll = jointData.roll;
    joint.pitch = jointData.pitch;
    joint.yaw = jointData.yaw;
    var component = new bg.scene[type](joint);
    node.addComponent(component);
  }
  var VWGLBParser = function() {
    function VWGLBParser(context, data) {
      this._context = context;
    }
    return ($traceurRuntime.createClass)(VWGLBParser, {
      loadDrawable: function(data, path) {
        this._jointData = null;
        var parsedData = this.parseData(data);
        return this.createDrawable(parsedData, path);
      },
      parseData: function(data) {
        var polyLists = [];
        var materials = null;
        var offset = 0;
        var header = new Uint8Array(data, 0, 8);
        offset = 8;
        var hdr = String.fromCharCode(header[4]) + String.fromCharCode(header[5]) + String.fromCharCode(header[6]) + String.fromCharCode(header[7]);
        if (header[0] == 1)
          throw "Could not open the model file. This file has been saved as computer (little endian) format, try again saving it in network (big endian) format";
        if (hdr != 'hedr')
          throw "File format error. Expecting header";
        var version = {
          maj: header[1],
          min: header[2],
          rev: header[3]
        };
        bg.log("vwglb file version: " + version.maj + "." + version.min + "." + version.rev + ", big endian");
        var numberOfPolyList = readInt(data, offset);
        offset += 4;
        var mtrl = readBlock(data, offset);
        offset += 4;
        if (mtrl != 'mtrl')
          throw "File format error. Expecting materials definition";
        var matResult = readString(data, offset);
        offset += matResult.offset;
        materials = JSON.parse(matResult.data);
        var proj = readBlock(data, offset);
        if (proj == 'proj') {
          offset += 4;
          var shadowTexFile = readString(data, offset);
          offset += shadowTexFile.offset;
          var attenuation = readFloat(data, offset);
          offset += 4;
          var projectionMatData = readMatrix4(data, offset);
          offset += projectionMatData.offset;
          var projMatrix = projectionMatData.data;
          var transformMatData = readMatrix4(data, offset);
          offset += transformMatData.offset;
          var transMatrix = transformMatData.data;
        }
        var join = readBlock(data, offset);
        if (join == 'join') {
          offset += 4;
          var jointData = readString(data, offset);
          offset += jointData.offset;
          var jointText = jointData.data;
          try {
            this._jointData = JSON.parse(jointText);
          } catch (e) {
            throw new Error("VWGLB file format reader: Error parsing joint data");
          }
        }
        var block = readBlock(data, offset);
        if (block != 'plst')
          throw "File format error. Expecting poly list";
        var done = false;
        offset += 4;
        var plistName;
        var matName;
        var vArray;
        var nArray;
        var t0Array;
        var t1Array;
        var t2Array;
        var iArray;
        while (!done) {
          block = readBlock(data, offset);
          offset += 4;
          var strData = null;
          var tarr = null;
          switch (block) {
            case 'pnam':
              strData = readString(data, offset);
              offset += strData.offset;
              plistName = strData.data;
              break;
            case 'mnam':
              strData = readString(data, offset);
              offset += strData.offset;
              matName = strData.data;
              break;
            case 'varr':
              var varr = readFloatArray(data, offset);
              offset += varr.offset;
              vArray = varr.data;
              break;
            case 'narr':
              var narr = readFloatArray(data, offset);
              offset += narr.offset;
              nArray = narr.data;
              break;
            case 't0ar':
              tarr = readFloatArray(data, offset);
              offset += tarr.offset;
              t0Array = tarr.data;
              break;
            case 't1ar':
              tarr = readFloatArray(data, offset);
              offset += tarr.offset;
              t1Array = tarr.data;
              break;
            case 't2ar':
              tarr = readFloatArray(data, offset);
              offset += tarr.offset;
              t2Array = tarr.data;
              break;
            case 'indx':
              var iarr = readIndexArray(data, offset);
              offset += iarr.offset;
              iArray = iarr.data;
              break;
            case 'plst':
            case 'endf':
              var plistData = {
                name: plistName,
                matName: matName,
                vertices: vArray,
                normal: nArray,
                texcoord0: t0Array,
                texcoord1: t1Array,
                texcoord2: t2Array,
                indices: iArray
              };
              polyLists.push(plistData);
              plistName = "";
              matName = "";
              vArray = null;
              nArray = null;
              t0Array = null;
              t1Array = null;
              t2Array = null;
              iArray = null;
              break;
            default:
              throw "File format exception. Unexpected poly list member found";
          }
          done = block == 'endf';
        }
        var parsedData = {
          version: version,
          polyList: polyLists,
          materials: {}
        };
        materials.forEach(function(matData) {
          parsedData.materials[matData.name] = matData;
        });
        return parsedData;
      },
      createDrawable: function(data, path) {
        var $__1 = this;
        var drawable = new bg.scene.Drawable(this.context);
        drawable._version = data.version;
        var promises = [];
        data.polyList.forEach(function(plistData) {
          var materialData = data.materials[plistData.matName];
          var polyList = new bg.base.PolyList($__1._context);
          polyList.name = plistData.name;
          polyList.vertex = plistData.vertices || polyList.vertex;
          polyList.normal = plistData.normal || polyList.normal;
          polyList.texCoord0 = plistData.texcoord0 || polyList.texCoord0;
          polyList.texCoord1 = plistData.texcoord1 || polyList.texCoord1;
          polyList.texCoord2 = plistData.texcoord2 || polyList.texCoord2;
          polyList.index = plistData.indices || polyList.index;
          polyList.groupName = materialData.groupName;
          polyList.visible = materialData.visible;
          polyList.build();
          promises.push(bg.base.Material.GetMaterialWithJson($__1._context, materialData, path).then(function(material) {
            drawable.addPolyList(polyList, material);
          }));
        });
        return Promise.all(promises).then(function() {
          return drawable;
        });
      },
      addComponents: function(node) {
        if (this._jointData) {
          var i = null;
          var o = null;
          if (this._jointData.input) {
            i = this._jointData.input;
          }
          if (this._jointData.output && this._jointData.output.length) {
            o = this._jointData.output[0];
          }
          if (i)
            addJoint(node, "InputChainJoint", i);
          if (o)
            addJoint(node, "OutputChainJoint", o);
        }
      }
    }, {});
  }();
  var VWGLBLoaderPlugin = function($__super) {
    function VWGLBLoaderPlugin() {
      $traceurRuntime.superConstructor(VWGLBLoaderPlugin).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(VWGLBLoaderPlugin, {
      acceptType: function(url, data) {
        var ext = bg.utils.Resource.GetExtension(url);
        return ext == "vwglb" || ext == "bg2";
      },
      load: function(context, url, data) {
        return new Promise(function(accept, reject) {
          if (data) {
            try {
              var parser = new VWGLBParser(context, data);
              var path = url.substr(0, url.lastIndexOf("/"));
              parser.loadDrawable(data, path).then(function(drawable) {
                var node = new bg.scene.Node(context, drawable.name);
                node.addComponent(drawable);
                parser.addComponents(node);
                accept(node);
              });
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error("Error loading drawable. Data is null"));
          }
        });
      }
    }, {}, $__super);
  }(bg.base.LoaderPlugin);
  var Bg2LoaderPlugin = function($__super) {
    function Bg2LoaderPlugin() {
      $traceurRuntime.superConstructor(Bg2LoaderPlugin).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(Bg2LoaderPlugin, {load: function(context, url, data) {
        var promise = $traceurRuntime.superGet(this, Bg2LoaderPlugin.prototype, "load").call(this, context, url, data);
        return new Promise(function(resolve, reject) {
          promise.then(function(node) {
            var basePath = url.split("/");
            basePath.pop();
            basePath = basePath.join("/") + '/';
            var matUrl = url.split(".");
            matUrl.pop();
            matUrl.push("bg2mat");
            matUrl = matUrl.join(".");
            bg.utils.Resource.LoadJson(matUrl).then(function(matData) {
              var promises = [];
              try {
                var drw = node.component("bg.scene.Drawable");
                drw.forEach(function(plist, mat) {
                  var matDef = null;
                  matData.some(function(defItem) {
                    if (defItem.name == plist.name) {
                      matDef = defItem;
                      return true;
                    }
                  });
                  if (matDef) {
                    var p = bg.base.Material.FromMaterialDefinition(context, matDef, basePath);
                    promises.push(p);
                    p.then(function(newMat) {
                      mat.assign(newMat);
                    });
                  }
                });
              } catch (err) {}
              return Promise.all(promises);
            }).then(function() {
              resolve(node);
            }).catch(function() {
              resolve(node);
            });
          }).catch(function(err) {
            reject(err);
          });
        });
      }}, {}, $__super);
  }(VWGLBLoaderPlugin);
  bg.base.VWGLBLoaderPlugin = VWGLBLoaderPlugin;
  bg.base.Bg2LoaderPlugin = Bg2LoaderPlugin;
})();

"use strict";
bg.manipulation = {};

"use strict";
(function() {
  var DrawGizmoVisitor = function($__super) {
    function DrawGizmoVisitor(pipeline, matrixState) {
      $traceurRuntime.superConstructor(DrawGizmoVisitor).call(this, pipeline, matrixState);
      this._sprite = bg.scene.PrimitiveFactory.PlanePolyList(pipeline.context, 1, 1, "z");
      this._gizmoScale = 1;
      this._gizmoIcons = [];
      this._show3dGizmos = true;
    }
    return ($traceurRuntime.createClass)(DrawGizmoVisitor, {
      get gizmoScale() {
        return this._gizmoScale;
      },
      set gizmoScale(s) {
        this._gizmoScale = s;
      },
      get show3dGizmos() {
        return this._show3dGizmos;
      },
      set show3dGizmos(g) {
        this._show3dGizmos = g;
      },
      clearGizmoIcons: function() {
        this._gizmoIcons = [];
      },
      addGizmoIcon: function(type, icon) {
        var visible = arguments[2] !== (void 0) ? arguments[2] : true;
        this._gizmoIcons.push({
          type: type,
          icon: icon,
          visible: visible
        });
      },
      setGizmoIconVisibility: function(type, visible) {
        this._gizmoIcons.some(function(iconData) {
          if (iconData.type == type) {
            iconData.visible = visible;
          }
        });
      },
      get gizmoIcons() {
        return this._gizmoIcons;
      },
      getGizmoIcon: function(node) {
        var icon = null;
        this._gizmoIcons.some(function(iconData) {
          if (node.component(iconData.type) && iconData.visible) {
            icon = iconData.icon;
            return true;
          }
        });
        return icon;
      },
      visit: function(node) {
        $traceurRuntime.superGet(this, DrawGizmoVisitor.prototype, "visit").call(this, node);
        var icon = this.getGizmoIcon(node);
        var gizmoOpacity = this.pipeline.effect.gizmoOpacity;
        var gizmoColor = this.pipeline.effect.color;
        this.pipeline.effect.color = bg.Color.White();
        var dt = this.pipeline.depthTest;
        this.pipeline.depthTest = false;
        if (icon) {
          this.pipeline.effect.texture = icon;
          this.pipeline.effect.gizmoOpacity = 1;
          this.matrixState.viewMatrixStack.push();
          this.matrixState.modelMatrixStack.push();
          this.matrixState.viewMatrixStack.mult(this.matrixState.modelMatrixStack.matrix);
          this.matrixState.modelMatrixStack.identity();
          this.matrixState.viewMatrixStack.matrix.setRow(0, new bg.Vector4(1, 0, 0, 0));
          this.matrixState.viewMatrixStack.matrix.setRow(1, new bg.Vector4(0, 1, 0, 0));
          this.matrixState.viewMatrixStack.matrix.setRow(2, new bg.Vector4(0, 0, 1, 0));
          var s = this.matrixState.cameraDistanceScale * 0.05 * this._gizmoScale;
          this.matrixState.viewMatrixStack.rotate(bg.Math.PI, 0, 1, 0);
          this.matrixState.viewMatrixStack.scale(s, s, s);
          this.pipeline.draw(this._sprite);
          this.matrixState.viewMatrixStack.pop();
          this.matrixState.modelMatrixStack.pop();
          this.pipeline.effect.gizmoOpacity = gizmoOpacity;
          this.pipeline.effect.texture = null;
        }
        if (this._show3dGizmos) {
          node.displayGizmo(this.pipeline, this.matrixState);
        }
        this.pipeline.effect.color = gizmoColor;
        this.pipeline.depthTest = dt;
      }
    }, {}, $__super);
  }(bg.scene.DrawVisitor);
  bg.manipulation = bg.manipulation || {};
  bg.manipulation.DrawGizmoVisitor = DrawGizmoVisitor;
})();

"use strict";
(function() {
  var GizmoManager = function($__super) {
    function GizmoManager(context) {
      $traceurRuntime.superConstructor(GizmoManager).call(this, context);
      this._gizmoOpacity = 0.9;
    }
    return ($traceurRuntime.createClass)(GizmoManager, {
      get pipeline() {
        if (!this._pipeline) {
          this._pipeline = new bg.base.Pipeline(this.context);
          this._pipeline.blendMode = bg.base.BlendMode.NORMAL;
          this._pipeline.effect = new bg.manipulation.GizmoEffect(this.context);
        }
        return this._pipeline;
      },
      get matrixState() {
        if (!this._matrixState) {
          this._matrixState = new bg.base.MatrixState();
        }
        return this._matrixState;
      },
      get drawVisitor() {
        if (!this._drawVisitor) {
          this._drawVisitor = new bg.manipulation.DrawGizmoVisitor(this.pipeline, this.matrixState);
        }
        return this._drawVisitor;
      },
      get gizmoOpacity() {
        return this._gizmoOpacity;
      },
      set gizmoOpacity(o) {
        this._gizmoOpacity = o;
      },
      get show3dGizmos() {
        return this.drawVisitor.show3dGizmos;
      },
      set show3dGizmos(g) {
        this.drawVisitor.show3dGizmos = g;
      },
      get working() {
        return this._working;
      },
      addGizmoIcon: function(type, iconTexture) {
        this.drawVisitor.addGizmoIcon(type, iconTexture);
      },
      get gizmoIconScale() {
        return this.drawVisitor.gizmoScale;
      },
      set gizmoIconScale(s) {
        this.drawVisitor.gizmoScale = s;
      },
      setGizmoIconVisibility: function(type, visible) {
        this.drawVisitor.setGizmoIconVisibility(type, visible);
      },
      hideGizmoIcon: function(type) {
        this.drawVisitor.setGizmoIconVisibility(type, false);
      },
      showGizmoIcon: function(type) {
        this.drawVisitor.setGizmoIconVisibility(type, true);
      },
      get gizmoIcons() {
        return this.drawVisitor.gizmoIcons;
      },
      loadGizmoIcons: function(iconData) {
        var basePath = arguments[1] !== (void 0) ? arguments[1] : "";
        var onProgress = arguments[2];
        var $__2 = this;
        return new Promise(function(resolve, reject) {
          var urls = [];
          var iconDataResult = [];
          iconData.forEach(function(data) {
            var itemData = {
              type: data.type,
              iconTexture: null
            };
            itemData.path = bg.utils.path.join(basePath, data.icon);
            urls.push(itemData.path);
            iconDataResult.push(itemData);
          });
          bg.base.Loader.Load($__2.context, urls, onProgress).then(function(result) {
            iconDataResult.forEach(function(dataItem) {
              dataItem.iconTexture = result[dataItem.path];
              $__2.addGizmoIcon(dataItem.type, dataItem.iconTexture);
            });
            resolve(iconDataResult);
          }).catch(function(err) {
            reject(err);
          });
        });
      },
      clearGizmoIcons: function() {
        this.drawVisitor.clearGizmoIcons();
      },
      startAction: function(gizmoPickData, pos) {
        this._working = true;
        this._startPoint = pos;
        this._currentGizmoData = gizmoPickData;
        if (this._currentGizmoData && this._currentGizmoData.node) {
          var gizmo = this._currentGizmoData.node.component("bg.manipulation.Gizmo");
          if (gizmo) {
            gizmo.beginDrag(this._currentGizmoData.action, pos);
          }
        }
      },
      move: function(pos, camera) {
        if (this._currentGizmoData && this._currentGizmoData.node) {
          var gizmo = this._currentGizmoData.node.component("bg.manipulation.Gizmo");
          if (gizmo) {
            pos.y = camera.viewport.height - pos.y;
            gizmo.drag(this._currentGizmoData.action, this._startPoint, pos, camera);
          }
          this._startPoint = pos;
        }
      },
      endAction: function() {
        if (this._currentGizmoData && this._currentGizmoData.node) {
          var gizmo = this._currentGizmoData.node.component("bg.manipulation.Gizmo");
          if (gizmo) {
            gizmo.endDrag(this._currentGizmoData.action);
          }
        }
        this._working = false;
        this._startPoint = null;
        this._currentGizmoData = null;
      },
      drawGizmos: function(sceneRoot, camera) {
        var clearDepth = arguments[2] !== (void 0) ? arguments[2] : true;
        var restorePipeline = bg.base.Pipeline.Current();
        var restoreMatrixState = bg.base.MatrixState.Current();
        bg.base.Pipeline.SetCurrent(this.pipeline);
        bg.base.MatrixState.SetCurrent(this.matrixState);
        this.pipeline.viewport = camera.viewport;
        this.pipeline.effect.matrixState = this.matrixState;
        if (clearDepth) {
          this.pipeline.clearBuffers(bg.base.ClearBuffers.DEPTH);
        }
        this.matrixState.projectionMatrixStack.set(camera.projection);
        this.matrixState.viewMatrixStack.set(camera.viewMatrix);
        var opacityLayer = this.pipeline.opacityLayer;
        this.pipeline.opacityLayer = bg.base.OpacityLayer.NONE;
        this.pipeline.blend = true;
        this.pipeline.effect.gizmoOpacity = this.gizmoOpacity;
        sceneRoot.accept(this.drawVisitor);
        this.pipeline.blend = false;
        this.pipeline.opacityLayer = opacityLayer;
        if (restorePipeline) {
          bg.base.Pipeline.SetCurrent(restorePipeline);
        }
        if (restoreMatrixState) {
          bg.base.MatrixState.SetCurrent(restoreMatrixState);
        }
      }
    }, {}, $__super);
  }(bg.app.ContextObject);
  bg.manipulation.GizmoManager = GizmoManager;
})();

"use strict";
(function() {
  var shaders = {};
  function initShaders() {
    shaders[bg.webgl1.EngineId] = {
      vertex: "\n\t\t\tattribute vec3 inVertex;\n\t\t\tattribute vec2 inTexCoord;\n\t\t\tattribute vec4 inVertexColor;\n\t\t\t\n\t\t\tuniform mat4 inModelMatrix;\n\t\t\tuniform mat4 inViewMatrix;\n\t\t\tuniform mat4 inProjectionMatrix;\n\t\t\t\n\t\t\tvarying vec2 fsTexCoord;\n\t\t\tvarying vec4 fsColor;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tfsTexCoord = inTexCoord;\n\t\t\t\tfsColor = inVertexColor;\n\t\t\t\tgl_Position = inProjectionMatrix * inViewMatrix * inModelMatrix * vec4(inVertex,1.0);\n\t\t\t}\n\t\t\t",
      fragment: "\n\t\t\tprecision highp float;\n\t\t\t\n\t\t\tuniform vec4 inColor;\n\t\t\tuniform sampler2D inTexture;\n\t\t\tuniform float inOpacity;\n\t\t\t\n\t\t\tvarying vec2 fsTexCoord;\n\t\t\tvarying vec4 fsColor;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tvec4 tex = texture2D(inTexture,fsTexCoord);\n\t\t\t\tgl_FragColor = vec4(fsColor.rgb * tex.rgb * inColor.rgb,inOpacity * tex.a);\n\t\t\t}\n\t\t\t"
    };
  }
  var GizmoEffect = function($__super) {
    function GizmoEffect(context) {
      $traceurRuntime.superConstructor(GizmoEffect).call(this, context);
      initShaders();
      this._gizmoOpacity = 1;
      this._color = bg.Color.White();
    }
    return ($traceurRuntime.createClass)(GizmoEffect, {
      get inputVars() {
        return {
          vertex: 'inVertex',
          color: 'inVertexColor',
          tex0: 'inTexCoord'
        };
      },
      set matrixState(m) {
        this._matrixState = m;
      },
      get matrixState() {
        return this._matrixState;
      },
      set texture(t) {
        this._texture = t;
      },
      get texture() {
        return this._texture;
      },
      set color(c) {
        this._color = c;
      },
      get color() {
        return this._color;
      },
      set gizmoOpacity(o) {
        this._gizmoOpacity = o;
      },
      get gizmoOpacity() {
        return this._gizmoOpacity;
      },
      get shader() {
        if (!this._shader) {
          this._shader = new bg.base.Shader(this.context);
          this._shader.addShaderSource(bg.base.ShaderType.VERTEX, shaders[bg.webgl1.EngineId].vertex);
          this._shader.addShaderSource(bg.base.ShaderType.FRAGMENT, shaders[bg.webgl1.EngineId].fragment);
          this._shader.link();
          if (!this._shader.status) {
            console.log(this._shader.compileError);
            console.log(this._shader.linkError);
          } else {
            this._shader.initVars(['inVertex', 'inVertexColor', 'inTexCoord'], ['inModelMatrix', 'inViewMatrix', 'inProjectionMatrix', 'inColor', 'inTexture', 'inOpacity']);
          }
        }
        return this._shader;
      },
      setupVars: function() {
        var whiteTexture = bg.base.TextureCache.WhiteTexture(this.context);
        this.shader.setMatrix4('inModelMatrix', this.matrixState.modelMatrixStack.matrixConst);
        this.shader.setMatrix4('inViewMatrix', new bg.Matrix4(this.matrixState.viewMatrixStack.matrixConst));
        this.shader.setMatrix4('inProjectionMatrix', this.matrixState.projectionMatrixStack.matrixConst);
        this.shader.setVector4('inColor', this.color);
        this.shader.setTexture('inTexture', this.texture ? this.texture : whiteTexture, bg.base.TextureUnit.TEXTURE_0);
        this.shader.setValueFloat('inOpacity', this.gizmoOpacity);
      }
    }, {}, $__super);
  }(bg.base.Effect);
  bg.manipulation.GizmoEffect = GizmoEffect;
  bg.manipulation.GizmoAction = {
    TRANSLATE: 1,
    ROTATE: 2,
    ROTATE_FINE: 3,
    SCALE: 4,
    TRANSLATE_X: 5,
    TRANSLATE_Y: 6,
    TRANSLATE_Z: 7,
    ROTATE_X: 8,
    ROTATE_Y: 9,
    ROTATE_Z: 10,
    SCALE_X: 11,
    SCALE_Y: 12,
    SCALE_Z: 13,
    NONE: 99
  };
  function getAction(plist) {
    if (/rotate.*fine/i.test(plist.name)) {
      return bg.manipulation.GizmoAction.ROTATE_FINE;
    }
    if (/rotate.*x/i.test(plist.name)) {
      return bg.manipulation.GizmoAction.ROTATE_X;
    }
    if (/rotate.*y/i.test(plist.name)) {
      return bg.manipulation.GizmoAction.ROTATE_Y;
    }
    if (/rotate.*z/i.test(plist.name)) {
      return bg.manipulation.GizmoAction.ROTATE_Z;
    } else if (/rotate/i.test(plist.name)) {
      return bg.manipulation.GizmoAction.ROTATE;
    } else if (/translate.*x/i.test(plist.name)) {
      return bg.manipulation.GizmoAction.TRANSLATE_X;
    } else if (/translate.*y/i.test(plist.name)) {
      return bg.manipulation.GizmoAction.TRANSLATE_Y;
    } else if (/translate.*z/i.test(plist.name)) {
      return bg.manipulation.GizmoAction.TRANSLATE_Z;
    } else if (/translate/i.test(plist.name)) {
      return bg.manipulation.GizmoAction.TRANSLATE;
    } else if (/scale.*x/i.test(plist.name)) {
      return bg.manipulation.GizmoAction.SCALE_X;
    } else if (/scale.*y/i.test(plist.name)) {
      return bg.manipulation.GizmoAction.SCALE_Y;
    } else if (/scale.*z/i.test(plist.name)) {
      return bg.manipulation.GizmoAction.SCALE_Z;
    } else if (/scale/i.test(plist.name)) {
      return bg.manipulation.GizmoAction.SCALE;
    }
  }
  var s_gizmoCache = {};
  var GizmoCache = function() {
    function GizmoCache(context) {
      this._context = context;
      this._gizmos = {};
    }
    return ($traceurRuntime.createClass)(GizmoCache, {
      find: function(url) {
        return this._gizmos[url];
      },
      register: function(url, gizmoItems) {
        this._gizmos[url] = gizmoItems;
      },
      unregister: function(url) {
        if (this._gizmos[url]) {
          delete this._gizmos[url];
        }
      },
      clear: function() {
        this._gizmos = {};
      }
    }, {Get: function(context) {
        if (!s_gizmoCache[context.uuid]) {
          s_gizmoCache[context.uuid] = new GizmoCache(context);
        }
        return s_gizmoCache[context.uuid];
      }});
  }();
  bg.manipulation.GizmoCache = GizmoCache;
  function loadGizmo(context, gizmoUrl, gizmoNode) {
    return new Promise(function(accept, reject) {
      if (!gizmoUrl) {
        accept([]);
        return;
      }
      bg.base.Loader.Load(context, gizmoUrl).then(function(node) {
        var drw = node.component("bg.scene.Drawable");
        var gizmoItems = [];
        if (drw) {
          drw.forEach(function(plist, material) {
            gizmoItems.push({
              id: bg.manipulation.Selectable.GetIdentifier(),
              type: bg.manipulation.SelectableType.GIZMO,
              plist: plist,
              material: material,
              action: getAction(plist),
              node: gizmoNode
            });
          });
        }
        accept(gizmoItems);
      }).catch(function(err) {
        reject(err);
      });
    });
  }
  function rotationBetweenPoints(axis, p1, p2, origin, inc) {
    if (!inc)
      inc = 0;
    var v1 = new bg.Vector3(p2);
    v1.sub(origin).normalize();
    var v2 = new bg.Vector3(p1);
    v2.sub(origin).normalize();
    var dot = v1.dot(v2);
    var alpha = Math.acos(dot);
    if (alpha >= inc || inc == 0) {
      if (inc != 0) {
        alpha = (alpha >= 2 * inc) ? 2 * inc : inc;
      }
      var sign = axis.dot(v1.cross(v2));
      if (sign < 0)
        alpha *= -1.0;
      var q = new bg.Quaternion(alpha, axis.x, axis.y, axis.z);
      q.normalize();
      if (!isNaN(q.x)) {
        return q;
      }
    }
    return new bg.Quaternion(0, 0, 1, 0);
  }
  var Gizmo = function($__super) {
    function Gizmo(gizmoPath) {
      var visible = arguments[1] !== (void 0) ? arguments[1] : true;
      $traceurRuntime.superConstructor(Gizmo).call(this);
      this._gizmoPath = gizmoPath;
      this._offset = new bg.Vector3(0);
      this._visible = visible;
      this._gizmoTransform = bg.Matrix4.Identity();
      this._gizmoP = bg.Matrix4.Identity();
      this._scale = 5;
      this._minSize = 0.5;
    }
    return ($traceurRuntime.createClass)(Gizmo, {
      clone: function() {
        var newGizmo = new Gizmo(this._gizmoPath);
        newGizmo.offset.assign(this._offset);
        newGizmo.visible = this._visible;
        return newGizmo;
      },
      get offset() {
        return this._offset;
      },
      set offset(v) {
        this._offset = v;
      },
      get visible() {
        return this._visible;
      },
      set visible(v) {
        this._visible = v;
      },
      get gizmoTransform() {
        return this._gizmoTransform;
      },
      beginDrag: function(action, pos) {},
      drag: function(action, startPos, endPos, camera) {},
      endDrag: function(action) {},
      findId: function(id) {
        var result = null;
        if (this._gizmoItems) {
          this._gizmoItems.some(function(item) {
            if (item.id.r == id.r && item.id.g == id.g && item.id.b == id.b && item.id.a == id.a) {
              result = item;
              return true;
            }
          });
        }
        return result;
      },
      init: function() {
        var $__1 = this;
        if (!this._error) {
          this._gizmoItems = [];
          loadGizmo(this.node.context, this._gizmoPath, this.node).then(function(gizmoItems) {
            $__1._gizmoItems = gizmoItems;
          }).catch(function(err) {
            $__1._error = true;
            throw err;
          });
        }
      },
      frame: function(delta) {},
      display: function(pipeline, matrixState) {
        if (!this._gizmoItems || !this.visible)
          return;
        matrixState.modelMatrixStack.push();
        var modelview = new bg.Matrix4(matrixState.viewMatrixStack.matrix);
        modelview.mult(matrixState.modelMatrixStack.matrix);
        var s = modelview.position.magnitude() / this._scale;
        matrixState.modelMatrixStack.matrix.setScale(s, s, s);
        if (pipeline.effect instanceof bg.manipulation.ColorPickEffect && (pipeline.opacityLayer & bg.base.OpacityLayer.GIZMOS || pipeline.opacityLayer & bg.base.OpacityLayer.GIZMOS_SELECTION)) {
          var dt = pipeline.depthTest;
          if (pipeline.opacityLayer & bg.base.OpacityLayer.GIZMOS_SELECTION) {
            pipeline.depthTest = true;
          } else {
            pipeline.depthTest = false;
          }
          this._gizmoItems.forEach(function(item) {
            pipeline.effect.pickId = new bg.Color(item.id.a / 255, item.id.b / 255, item.id.g / 255, item.id.r / 255);
            pipeline.draw(item.plist);
          });
          pipeline.depthTest = dt;
        } else if (pipeline.effect instanceof bg.manipulation.GizmoEffect) {
          this._gizmoItems.forEach(function(item) {
            pipeline.effect.texture = item.material.texture;
            pipeline.effect.color = item.material.diffuse;
            pipeline.draw(item.plist);
          });
        }
        matrixState.modelMatrixStack.pop();
      }
    }, {}, $__super);
  }(bg.scene.Component);
  function translateMatrix(gizmo, intersection) {
    var matrix = new bg.Matrix4(gizmo.transform.matrix);
    var rotation = matrix.rotation;
    var origin = matrix.position;
    if (!gizmo._lastPickPoint) {
      gizmo._lastPickPoint = intersection.ray.end;
      gizmo._translateOffset = new bg.Vector3(origin);
      gizmo._translateOffset.sub(intersection.ray.end);
    }
    switch (Math.abs(gizmo.plane)) {
      case bg.Axis.X:
        matrix = bg.Matrix4.Translation(origin.x, intersection.point.y + gizmo._translateOffset.y, intersection.point.z + gizmo._translateOffset.z);
        break;
      case bg.Axis.Y:
        matrix = bg.Matrix4.Translation(intersection.point.x + gizmo._translateOffset.x, origin.y, intersection.point.z + gizmo._translateOffset.z);
        break;
      case bg.Axis.Z:
        matrix = bg.Matrix4.Translation(intersection.point.x + gizmo._translateOffset.x, intersection.point.y + gizmo._translateOffset.y, origin.z);
        break;
    }
    matrix.mult(rotation);
    gizmo._lastPickPoint = intersection.point;
    return matrix;
  }
  function rotateMatrix(gizmo, intersection, fine) {
    var matrix = new bg.Matrix4(gizmo.transform.matrix);
    var rotation = matrix.rotation;
    var origin = matrix.position;
    if (!gizmo._lastPickPoint) {
      gizmo._lastPickPoint = intersection.ray.end;
      gizmo._translateOffset = new bg.Vector3(origin);
      gizmo._translateOffset.sub(intersection.ray.end);
    }
    if (!fine) {
      var prevRotation = new bg.Matrix4(rotation);
      rotation = rotationBetweenPoints(gizmo.planeAxis, gizmo._lastPickPoint, intersection.point, origin, bg.Math.degreesToRadians(22.5));
      if (rotation.x != 0 || rotation.y != 0 || rotation.z != 0 || rotation.w != 1) {
        matrix = bg.Matrix4.Translation(origin).mult(rotation.getMatrix4()).mult(prevRotation);
        gizmo._lastPickPoint = intersection.point;
      }
    } else {
      var prevRotation$__2 = new bg.Matrix4(rotation);
      rotation = rotationBetweenPoints(gizmo.planeAxis, gizmo._lastPickPoint, intersection.point, origin);
      if (rotation.x != 0 || rotation.y != 0 || rotation.z != 0 || rotation.w != 1) {
        matrix = bg.Matrix4.Translation(origin).mult(rotation.getMatrix4()).mult(prevRotation$__2);
        gizmo._lastPickPoint = intersection.point;
      }
    }
    return matrix;
  }
  function calculateClosestPlane(gizmo, matrixState) {
    var cameraForward = matrixState.viewMatrixStack.matrix.forwardVector;
    var upVector = matrixState.viewMatrixStack.matrix.upVector;
    var xVector = new bg.Vector3(1, 0, 0);
    var yVector = new bg.Vector3(0, 1, 0);
    var zVector = new bg.Vector3(0, 0, 1);
    var xVectorInv = new bg.Vector3(-1, 0, 0);
    var yVectorInv = new bg.Vector3(0, -1, 0);
    var zVectorInv = new bg.Vector3(0, 0, -1);
    var upAlpha = Math.acos(upVector.dot(yVector));
    if (upAlpha > 0.9) {
      gizmo.plane = bg.Axis.Y;
    } else {
      var angles = [Math.acos(cameraForward.dot(xVector)), Math.acos(cameraForward.dot(yVector)), Math.acos(cameraForward.dot(zVector)), Math.acos(cameraForward.dot(xVectorInv)), Math.acos(cameraForward.dot(yVectorInv)), Math.acos(cameraForward.dot(zVectorInv))];
      var min = angles[0];
      var planeIndex = 0;
      angles.reduce(function(prev, v, index) {
        if (v < min) {
          planeIndex = index;
          min = v;
        }
      });
      switch (planeIndex) {
        case 0:
          gizmo.plane = -bg.Axis.X;
          break;
        case 1:
          gizmo.plane = bg.Axis.Y;
          break;
        case 2:
          gizmo.plane = bg.Axis.Z;
          break;
        case 3:
          gizmo.plane = bg.Axis.X;
          break;
        case 4:
          gizmo.plane = -bg.Axis.Y;
          break;
        case 5:
          gizmo.plane = -bg.Axis.Z;
          break;
      }
    }
  }
  var PlaneGizmo = function($__super) {
    function PlaneGizmo(path) {
      var visible = arguments[1] !== (void 0) ? arguments[1] : true;
      $traceurRuntime.superConstructor(PlaneGizmo).call(this, path, visible);
      this._plane = bg.Axis.Y;
      this._autoPlaneMode = true;
    }
    return ($traceurRuntime.createClass)(PlaneGizmo, {
      get plane() {
        return this._plane;
      },
      set plane(a) {
        this._plane = a;
      },
      get autoPlaneMode() {
        return this._autoPlaneMode;
      },
      set autoPlaneMode(m) {
        this._autoPlaneMode = m;
      },
      get planeAxis() {
        switch (Math.abs(this.plane)) {
          case bg.Axis.X:
            return new bg.Vector3(1, 0, 0);
          case bg.Axis.Y:
            return new bg.Vector3(0, 1, 0);
          case bg.Axis.Z:
            return new bg.Vector3(0, 0, 1);
        }
      },
      get gizmoTransform() {
        var result = bg.Matrix4.Identity();
        switch (this.plane) {
          case bg.Axis.X:
            return bg.Matrix4.Rotation(bg.Math.degreesToRadians(90), 0, 0, -1);
          case bg.Axis.Y:
            break;
          case bg.Axis.Z:
            return bg.Matrix4.Rotation(bg.Math.degreesToRadians(90), 1, 0, 0);
          case -bg.Axis.X:
            return bg.Matrix4.Rotation(bg.Math.degreesToRadians(90), 0, 0, 1);
          case -bg.Axis.Y:
            return bg.Matrix4.Rotation(bg.Math.degreesToRadians(180), 0, -1, 0);
          case -bg.Axis.Z:
            return bg.Matrix4.Rotation(bg.Math.degreesToRadians(90), -1, 0, 0);
        }
        return result;
      },
      clone: function() {
        var newGizmo = new PlaneGizmo(this._gizmoPath);
        newGizmo.offset.assign(this._offset);
        newGizmo.visible = this._visible;
        return newGizmo;
      },
      init: function() {
        $traceurRuntime.superGet(this, PlaneGizmo.prototype, "init").call(this);
        this._gizmoP = bg.Matrix4.Translation(this.transform.matrix.position);
      },
      display: function(pipeline, matrixState) {
        if (!this._gizmoItems || !this.visible)
          return;
        if (this.autoPlaneMode) {
          calculateClosestPlane(this, matrixState);
        }
        if (!this._gizmoItems || !this.visible)
          return;
        var modelview = new bg.Matrix4(matrixState.viewMatrixStack.matrix);
        modelview.mult(matrixState.modelMatrixStack.matrix);
        var s = modelview.position.magnitude() / this._scale;
        s = s < this._minSize ? this._minSize : s;
        var gizmoTransform = this.gizmoTransform;
        gizmoTransform.setScale(s, s, s);
        matrixState.modelMatrixStack.push();
        matrixState.modelMatrixStack.mult(gizmoTransform);
        if (pipeline.effect instanceof bg.manipulation.ColorPickEffect && (pipeline.opacityLayer & bg.base.OpacityLayer.GIZMOS || pipeline.opacityLayer & bg.base.OpacityLayer.GIZMOS_SELECTION)) {
          var dt = pipeline.depthTest;
          if (pipeline.opacityLayer & bg.base.OpacityLayer.GIZMOS_SELECTION) {
            pipeline.depthTest = true;
          } else {
            pipeline.depthTest = false;
          }
          this._gizmoItems.forEach(function(item) {
            pipeline.effect.pickId = new bg.Color(item.id.a / 255, item.id.b / 255, item.id.g / 255, item.id.r / 255);
            pipeline.draw(item.plist);
          });
          pipeline.depthTest = dt;
        } else if (pipeline.effect instanceof bg.manipulation.GizmoEffect) {
          this._gizmoItems.forEach(function(item) {
            pipeline.effect.texture = item.material.texture;
            pipeline.effect.color = item.material.diffuse;
            pipeline.draw(item.plist);
          });
        }
        matrixState.modelMatrixStack.pop();
      },
      beginDrag: function(action, pos) {
        this._lastPickPoint = null;
      },
      drag: function(action, startPos, endPos, camera) {
        if (this.transform) {
          var plane = new bg.physics.Plane(this.planeAxis);
          var ray = bg.physics.Ray.RayWithScreenPoint(endPos, camera.projection, camera.viewMatrix, camera.viewport);
          var intersection = bg.physics.Intersection.RayToPlane(ray, plane);
          if (intersection.intersects()) {
            var matrix = new bg.Matrix4(this.transform.matrix);
            this._gizmoP = bg.Matrix4.Translation(this.transform.matrix.position);
            switch (action) {
              case bg.manipulation.GizmoAction.TRANSLATE:
                matrix = translateMatrix(this, intersection);
                break;
              case bg.manipulation.GizmoAction.ROTATE:
                matrix = rotateMatrix(this, intersection, false);
                break;
              case bg.manipulation.GizmoAction.ROTATE_FINE:
                matrix = rotateMatrix(this, intersection, true);
                break;
            }
            this.transform.matrix = matrix;
          }
        }
      },
      endDrag: function(action) {
        this._lastPickPoint = null;
      }
    }, {}, $__super);
  }(Gizmo);
  var UnifiedGizmo = function($__super) {
    function UnifiedGizmo(path) {
      var visible = arguments[1] !== (void 0) ? arguments[1] : true;
      $traceurRuntime.superConstructor(UnifiedGizmo).call(this, path, visible);
      this._translateSpeed = 0.005;
      this._rotateSpeed = 0.005;
      this._scaleSpeed = 0.001;
      this._gizmoTransform = bg.Matrix4.Identity();
    }
    return ($traceurRuntime.createClass)(UnifiedGizmo, {
      get gizmoTransform() {
        return this._gizmoTransform;
      },
      get translateSpeed() {
        return this._translateSpeed;
      },
      set translateSpeed(s) {
        this._translateSpeed = s;
      },
      get rotateSpeed() {
        return this._rotateSpeed;
      },
      set rotateSpeed(s) {
        this._rotateSpeed = s;
      },
      get scaleSpeed() {
        return this._scaleSpeed;
      },
      set scaleSpeed(s) {
        this._scaleSpeed = s;
      },
      clone: function() {
        var newGizmo = new PlaneGizmo(this._gizmoPath);
        newGizmo.offset.assign(this._offset);
        newGizmo.visible = this._visible;
        return newGizmo;
      },
      init: function() {
        $traceurRuntime.superGet(this, UnifiedGizmo.prototype, "init").call(this);
        this._gizmoP = bg.Matrix4.Translation(this.transform.matrix.position);
        this._gizmoTransform = this.transform.matrix.rotation;
      },
      display: function(pipeline, matrixState) {
        if (!this._gizmoItems || !this.visible)
          return;
        $traceurRuntime.superGet(this, UnifiedGizmo.prototype, "display").call(this, pipeline, matrixState);
      },
      beginDrag: function(action, pos) {
        this._lastPickPoint = null;
      },
      drag: function(action, startPos, endPos, camera) {
        if (this.transform) {
          if (!this._lastPickPoint) {
            this._lastPickPoint = endPos;
          }
          var matrix = new bg.Matrix4(this.transform.matrix);
          this._gizmoP = bg.Matrix4.Translation(this.transform.matrix.position);
          var diff = new bg.Vector2(this._lastPickPoint);
          diff.sub(endPos);
          var matrixState = bg.base.MatrixState.Current();
          var modelview = new bg.Matrix4(matrixState.viewMatrixStack.matrix);
          modelview.mult(matrixState.modelMatrixStack.matrix);
          var s = modelview.position.magnitude() / this._scale;
          s = s < this._minSize ? this._minSize : s;
          var scale = matrix.getScale();
          var scaleFactor = 1 - ((diff.x + diff.y) * this.scaleSpeed);
          switch (action) {
            case bg.manipulation.GizmoAction.SCALE:
              matrix.scale(scaleFactor, scaleFactor, scaleFactor);
              break;
            case bg.manipulation.GizmoAction.TRANSLATE_X:
              matrix.translate(-(diff.x + diff.y) * this.translateSpeed * s / scale.x, 0, 0);
              break;
            case bg.manipulation.GizmoAction.TRANSLATE_Y:
              matrix.translate(0, -(diff.x + diff.y) * this.translateSpeed * s / scale.y, 0);
              break;
            case bg.manipulation.GizmoAction.TRANSLATE_Z:
              matrix.translate(0, 0, -(diff.x + diff.y) * this.translateSpeed * s / scale.z);
              break;
            case bg.manipulation.GizmoAction.ROTATE_X:
              matrix.rotate((diff.x + diff.y) * this.rotateSpeed, 1, 0, 0);
              this._gizmoP.rotate((diff.x + diff.y) * this.rotateSpeed, 1, 0, 0);
              break;
            case bg.manipulation.GizmoAction.ROTATE_Y:
              matrix.rotate((diff.x + diff.y) * this.rotateSpeed, 0, 1, 0);
              this._gizmoP.rotate((diff.x + diff.y) * this.rotateSpeed, 0, 1, 0);
              break;
            case bg.manipulation.GizmoAction.ROTATE_Z:
              matrix.rotate((diff.x + diff.y) * this.rotateSpeed, 0, 0, 1);
              this._gizmoP.rotate((diff.x + diff.y) * this.rotateSpeed, 0, 0, 1);
              break;
            case bg.manipulation.GizmoAction.SCALE_X:
              matrix.scale(scaleFactor, 1, 1);
              break;
            case bg.manipulation.GizmoAction.SCALE_Y:
              matrix.scale(1, scaleFactor, 1);
              break;
            case bg.manipulation.GizmoAction.SCALE_Z:
              matrix.scale(1, 1, scaleFactor);
              break;
          }
          this.transform.matrix = matrix;
          this._lastPickPoint = endPos;
        }
      },
      endDrag: function(action) {
        this._lastPickPoint = null;
      }
    }, {}, $__super);
  }(Gizmo);
  bg.manipulation.GizmoMode = {
    SELECT: 0,
    TRANSLATE: 1,
    ROTATE: 2,
    SCALE: 3,
    TRANSFORM: 4
  };
  var MultiModeGizmo = function($__super) {
    function MultiModeGizmo(unified, translate, rotate, scale) {
      $traceurRuntime.superConstructor(MultiModeGizmo).call(this, unified);
      this.mode = bg.manipulation.GizmoMode.TRANSFORM;
      this._transformPath = unified;
      this._translatePath = translate;
      this._rotatePath = rotate;
      this._scalePath = scale;
      this._gizmoPath = unified;
    }
    return ($traceurRuntime.createClass)(MultiModeGizmo, {
      get visible() {
        return this._mode != bg.manipulation.GizmoMode.SELECT && this._visible;
      },
      set visible(v) {
        this._visible = v;
      },
      get mode() {
        return this._mode;
      },
      set mode(m) {
        var $__1 = this;
        this._mode = m;
        this._gizmoItems = [];
        switch (m) {
          case bg.manipulation.GizmoMode.SELECT:
            this._gizmoPath = "";
            break;
          case bg.manipulation.GizmoMode.TRANSLATE:
            this._gizmoPath = this._translatePath;
            break;
          case bg.manipulation.GizmoMode.ROTATE:
            this._gizmoPath = this._rotatePath;
            break;
          case bg.manipulation.GizmoMode.SCALE:
            this._gizmoPath = this._scalePath;
            break;
          case bg.manipulation.GizmoMode.TRANSFORM:
            this._gizmoPath = this._transformPath;
            break;
        }
        if (this._gizmoPath) {
          loadGizmo(this.node.context, this._gizmoPath, this.node).then(function(gizmoItems) {
            $__1._gizmoItems = gizmoItems;
            bg.emitImageLoadEvent();
          }).catch(function(err) {
            $__1._error = true;
            throw err;
          });
        }
      }
    }, {}, $__super);
  }(UnifiedGizmo);
  bg.scene.registerComponent(bg.manipulation, Gizmo, "bg.manipulation.Gizmo");
  bg.scene.registerComponent(bg.manipulation, PlaneGizmo, "bg.manipulation.Gizmo");
  bg.scene.registerComponent(bg.manipulation, UnifiedGizmo, "bg.manipulation.Gizmo");
  bg.scene.registerComponent(bg.manipulation, MultiModeGizmo, "bg.manipulation.Gizmo");
})();

"use strict";
(function() {
  var shader = {};
  function initShaders() {
    shader[bg.webgl1.EngineId] = {
      vertex: "\n\t\t\tattribute vec3 inVertex;\n\t\t\t\n\t\t\tuniform mat4 inModelMatrix;\n\t\t\tuniform mat4 inViewMatrix;\n\t\t\tuniform mat4 inProjectionMatrix;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tgl_Position = inProjectionMatrix * inViewMatrix * inModelMatrix * vec4(inVertex,1.0);\n\t\t\t}\n\t\t\t",
      fragment: "\n\t\t\tprecision highp float;\n\t\t\t\n\t\t\tuniform vec4 inColorId;\n\t\t\t\n\t\t\tvoid main() {\n\t\t\t\tgl_FragColor = inColorId;\n\t\t\t}\n\t\t\t"
    };
  }
  var ColorPickEffect = function($__super) {
    function ColorPickEffect(context) {
      $traceurRuntime.superConstructor(ColorPickEffect).call(this, context);
      initShaders();
    }
    return ($traceurRuntime.createClass)(ColorPickEffect, {
      get inputVars() {
        return {vertex: 'inVertex'};
      },
      set matrixState(m) {
        this._matrixState = m;
      },
      get matrixState() {
        return this._matrixState;
      },
      set pickId(p) {
        this._pickId = p;
      },
      get pickId() {
        return this._pickId || bg.Color.Transparent();
      },
      get shader() {
        if (!this._shader) {
          this._shader = new bg.base.Shader(this.context);
          this._shader.addShaderSource(bg.base.ShaderType.VERTEX, shader[bg.webgl1.EngineId].vertex);
          this._shader.addShaderSource(bg.base.ShaderType.FRAGMENT, shader[bg.webgl1.EngineId].fragment);
          this._shader.link();
          if (!this._shader.status) {
            console.log(this._shader.compileError);
            console.log(this._shader.linkError);
          } else {
            this._shader.initVars(['inVertex'], ['inModelMatrix', 'inViewMatrix', 'inProjectionMatrix', 'inColorId']);
          }
        }
        return this._shader;
      },
      setupVars: function() {
        this.shader.setMatrix4('inModelMatrix', this.matrixState.modelMatrixStack.matrixConst);
        this.shader.setMatrix4('inViewMatrix', new bg.Matrix4(this.matrixState.viewMatrixStack.matrixConst));
        this.shader.setMatrix4('inProjectionMatrix', this.matrixState.projectionMatrixStack.matrixConst);
        this.shader.setVector4('inColorId', this.pickId);
      }
    }, {}, $__super);
  }(bg.base.Effect);
  bg.manipulation.ColorPickEffect = ColorPickEffect;
  var FindPickIdVisitor = function($__super) {
    function FindPickIdVisitor(target) {
      $traceurRuntime.superConstructor(FindPickIdVisitor).call(this);
      this._target = target;
    }
    return ($traceurRuntime.createClass)(FindPickIdVisitor, {
      get target() {
        return this._target;
      },
      set target(t) {
        this._target = t;
        this._result = null;
      },
      get result() {
        return this._result;
      },
      visit: function(node) {
        var selectable = node.component("bg.manipulation.Selectable");
        var gizmo = node.component("bg.manipulation.Gizmo");
        if (gizmo && !gizmo.visible) {
          gizmo = null;
        }
        this._result = this._result || (selectable && selectable.findId(this.target)) || (gizmo && gizmo.findId(this.target));
      }
    }, {}, $__super);
  }(bg.scene.NodeVisitor);
  bg.manipulation.FindPickIdVisitor = FindPickIdVisitor;
  var MousePicker = function($__super) {
    function MousePicker(context) {
      $traceurRuntime.superConstructor(MousePicker).call(this, context);
    }
    return ($traceurRuntime.createClass)(MousePicker, {
      get pipeline() {
        if (!this._pipeline) {
          this._pipeline = new bg.base.Pipeline(this.context);
          this._pipeline.effect = new ColorPickEffect(this.context);
          this._renderSurface = new bg.base.TextureSurface(this.context);
          this._renderSurface.create();
          this._pipeline.renderSurface = this._renderSurface;
          this._pipeline.clearColor = new bg.Color(0, 0, 0, 0);
        }
        return this._pipeline;
      },
      get matrixState() {
        if (!this._matrixState) {
          this._matrixState = new bg.base.MatrixState();
        }
        return this._matrixState;
      },
      get drawVisitor() {
        if (!this._drawVisitor) {
          this._drawVisitor = new bg.scene.DrawVisitor(this.pipeline, this.matrixState);
        }
        return this._drawVisitor;
      },
      pick: function(sceneRoot, camera, mousePosition) {
        var restorePipeline = bg.base.Pipeline.Current();
        var restoreMatrixState = bg.base.MatrixState.Current();
        bg.base.Pipeline.SetCurrent(this.pipeline);
        bg.base.MatrixState.SetCurrent(this.matrixState);
        this.pipeline.viewport = camera.viewport;
        this.pipeline.effect.matrixState = this.matrixState;
        this.pipeline.clearBuffers(bg.base.ClearBuffers.COLOR | bg.base.ClearBuffers.DEPTH);
        this.matrixState.projectionMatrixStack.set(camera.projection);
        this.matrixState.viewMatrixStack.set(camera.viewMatrix);
        var opacityLayer = this.pipeline.opacityLayer;
        this.pipeline.opacityLayer = bg.base.OpacityLayer.SELECTION;
        sceneRoot.accept(this.drawVisitor);
        this.pipeline.opacityLayer = bg.base.OpacityLayer.GIZMOS_SELECTION;
        this.pipeline.clearBuffers(bg.base.ClearBuffers.DEPTH);
        sceneRoot.accept(this.drawVisitor);
        this.pipeline.opacityLayer = opacityLayer;
        var buffer = this.pipeline.renderSurface.readBuffer(new bg.Viewport(mousePosition.x, mousePosition.y, 1, 1));
        var pickId = {
          r: buffer[3],
          g: buffer[2],
          b: buffer[1],
          a: buffer[0]
        };
        var findIdVisitor = new FindPickIdVisitor(pickId);
        sceneRoot.accept(findIdVisitor);
        if (restorePipeline) {
          bg.base.Pipeline.SetCurrent(restorePipeline);
        }
        if (restoreMatrixState) {
          bg.base.MatrixState.SetCurrent(restoreMatrixState);
        }
        return findIdVisitor.result;
      }
    }, {}, $__super);
  }(bg.app.ContextObject);
  bg.manipulation.MousePicker = MousePicker;
})();

"use strict";
(function() {
  var s_r = 0;
  var s_g = 0;
  var s_b = 0;
  var s_a = 0;
  function incrementIdentifier() {
    if (s_r == 255) {
      s_r = 0;
      incG();
    } else {
      ++s_r;
    }
  }
  function incG() {
    if (s_g == 255) {
      s_g = 0;
      incB();
    } else {
      ++s_g;
    }
  }
  function incB() {
    if (s_b == 255) {
      s_b = 0;
      incA();
    } else {
      ++s_b;
    }
  }
  function incA() {
    if (s_a == 255) {
      s_a = 0;
      bg.log("WARNING: Maximum number of picker identifier reached.");
    } else {
      ++s_a;
    }
  }
  function getIdentifier() {
    incrementIdentifier();
    return {
      r: s_r,
      g: s_g,
      b: s_g,
      a: s_a
    };
  }
  var s_selectMode = false;
  bg.manipulation.SelectableType = {
    PLIST: 1,
    GIZMO: 2,
    GIZMO_ICON: 3
  };
  var s_selectionIconPlist = null;
  function selectionIconPlist() {
    if (!s_selectionIconPlist) {
      s_selectionIconPlist = bg.scene.PrimitiveFactory.SpherePolyList(this.node.context, 0.5);
    }
    return s_selectionIconPlist;
  }
  var g_selectableIcons = ["bg.scene.Camera", "bg.scene.Light", "bg.scene.Transform"];
  var Selectable = function($__super) {
    function Selectable() {
      $traceurRuntime.superConstructor(Selectable).call(this);
      this._initialized = false;
      this._selectablePlist = [];
    }
    return ($traceurRuntime.createClass)(Selectable, {
      clone: function() {
        return new Selectable();
      },
      buildIdentifier: function() {
        this._initialized = false;
        this._selectablePlist = [];
      },
      findId: function(id) {
        var result = null;
        this._selectablePlist.some(function(item) {
          if (item.id.r == id.r && item.id.g == id.g && item.id.b == id.b && item.id.a == id.a) {
            result = item;
            return true;
          }
        });
        return result;
      },
      frame: function(delta) {
        var $__1 = this;
        if (!this._initialized && this.drawable) {
          this.drawable.forEach(function(plist, material) {
            var id = getIdentifier();
            $__1._selectablePlist.push({
              id: id,
              type: bg.manipulation.SelectableType.PLIST,
              plist: plist,
              material: material,
              drawable: $__1.drawable,
              node: $__1.node
            });
          });
          this._initialized = true;
        } else if (!this._initialized) {
          var id = getIdentifier();
          this._selectablePlist.push({
            id: id,
            type: bg.manipulation.SelectableType.GIZMO_ICON,
            plist: null,
            material: null,
            drawable: null,
            node: this.node
          });
          this._initialized = true;
        }
      },
      display: function(pipeline, matrixState) {
        var $__1 = this;
        if (pipeline.effect instanceof bg.manipulation.ColorPickEffect && pipeline.opacityLayer & bg.base.OpacityLayer.SELECTION) {
          var selectableByIcon = g_selectableIcons.some(function(componentType) {
            return $__1.node.component(componentType) != null;
          });
          this._selectablePlist.forEach(function(item) {
            var pickId = new bg.Color(item.id.a / 255, item.id.b / 255, item.id.g / 255, item.id.r / 255);
            if (item.plist && item.plist.visible) {
              pipeline.effect.pickId = pickId;
              pipeline.draw(item.plist);
            } else if (!item.plist && selectableByIcon) {
              var s = matrixState.cameraDistanceScale * 0.1;
              pipeline.effect.pickId = pickId;
              matrixState.modelMatrixStack.push();
              matrixState.modelMatrixStack.scale(s, s, s);
              pipeline.draw(selectionIconPlist.apply($__1));
              matrixState.modelMatrixStack.pop();
            }
          });
        }
      }
    }, {
      SetSelectableIcons: function(sel) {
        g_selectableIcons = sel;
      },
      AddSelectableIcon: function(sel) {
        if (g_selectableIcons.indexOf(sel) == -1) {
          g_selectableIcons.push(sel);
        }
      },
      RemoveSelectableIcon: function(sel) {
        var index = g_selectableIcons.indexOf(sel);
        if (index >= 0) {
          g_selectableIcons.splice(index, 1);
        }
      },
      SetSelectMode: function(m) {
        s_selectMode = m;
      },
      GetIdentifier: function() {
        return getIdentifier();
      }
    }, $__super);
  }(bg.scene.Component);
  bg.scene.registerComponent(bg.manipulation, Selectable, "bg.manipulation.Selectable");
})();

"use strict";
(function() {
  function lib() {
    return bg.base.ShaderLibrary.Get();
  }
  var BorderDetectionEffect = function($__super) {
    function BorderDetectionEffect(context) {
      $traceurRuntime.superConstructor(BorderDetectionEffect).call(this, context);
      var vertex = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
      var fragment = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
      vertex.addParameter([lib().inputs.buffers.vertex, lib().inputs.buffers.tex0, {
        name: "fsTexCoord",
        dataType: "vec2",
        role: "out"
      }]);
      fragment.addParameter([lib().inputs.material.texture, {
        name: "inTexSize",
        dataType: "vec2",
        role: "value"
      }, {
        name: "inConvMatrix",
        dataType: "float",
        role: "value",
        vec: 9
      }, {
        name: "inBorderColor",
        dataType: "vec4",
        role: "value"
      }, {
        name: "inBorderWidth",
        dataType: "float",
        role: "value"
      }, {
        name: "fsTexCoord",
        dataType: "vec2",
        role: "in"
      }]);
      if (bg.Engine.Get().id == "webgl1") {
        vertex.setMainBody("\n                gl_Position = vec4(inVertex,1.0);\n                fsTexCoord = inTex0;\n                ");
        fragment.addFunction(lib().functions.utils.applyConvolution);
        fragment.setMainBody("\n                vec4 selectionColor = applyConvolution(inTexture,fsTexCoord,inTexSize,inConvMatrix,inBorderWidth);\n                if (selectionColor.r!=0.0 && selectionColor.g!=0.0 && selectionColor.b!=0.0) {\n                    gl_FragColor = inBorderColor;\n                }\n                else {\n                    discard;\n                }\n                ");
      }
      this.setupShaderSource([vertex, fragment]);
      this._highlightColor = bg.Color.White();
      this._borderWidth = 2;
    }
    return ($traceurRuntime.createClass)(BorderDetectionEffect, {
      get highlightColor() {
        return this._highlightColor;
      },
      set highlightColor(c) {
        this._highlightColor = c;
      },
      get borderWidth() {
        return this._borderWidth;
      },
      set borderWidth(w) {
        this._borderWidth = w;
      },
      setupVars: function() {
        var texture = null;
        if (this._surface instanceof bg.base.Texture) {
          texture = this._surface;
        } else if (this._surface instanceof bg.base.RenderSurface) {
          texture = this._surface.getTexture(0);
        }
        if (texture) {
          this.shader.setTexture("inTexture", texture, bg.base.TextureUnit.TEXTURE_0);
          this.shader.setVector2("inTexSize", texture.size);
        }
        var convMatrix = [0, 1, 0, 1, -4, 1, 0, 1, 0];
        this.shader.setValueFloatPtr("inConvMatrix", convMatrix);
        this.shader.setVector4("inBorderColor", this._highlightColor);
        this.shader.setValueFloat("inBorderWidth", this._borderWidth);
      }
    }, {}, $__super);
  }(bg.base.TextureEffect);
  bg.manipulation.BorderDetectionEffect = BorderDetectionEffect;
  var s_plainColorVertex = null;
  var s_plainColorFragment = null;
  function plainColorVertex() {
    if (!s_plainColorVertex) {
      s_plainColorVertex = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
      s_plainColorVertex.addParameter(lib().inputs.buffers.vertex);
      s_plainColorVertex.addParameter(lib().inputs.matrix.all);
      if (bg.Engine.Get().id == "webgl1") {
        s_plainColorVertex.setMainBody("\n                    gl_Position = inProjectionMatrix * inViewMatrix * inModelMatrix * vec4(inVertex,1.0);\n                ");
      }
    }
    return s_plainColorVertex;
  }
  function plainColorFragment() {
    if (!s_plainColorFragment) {
      s_plainColorFragment = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
      s_plainColorFragment.addParameter([{
        name: "inColor",
        dataType: "vec4",
        role: "value"
      }, {
        name: "inSelectMode",
        dataType: "int",
        role: "value"
      }]);
      if (bg.Engine.Get().id == "webgl1") {
        s_plainColorFragment.setMainBody("\n                    if (inSelectMode==0) {\n                        discard;\n                    }\n                    else {\n                        gl_FragColor = inColor;\n                    }\n                ");
      }
    }
    return s_plainColorFragment;
  }
  var PlainColorEffect = function($__super) {
    function PlainColorEffect(context) {
      $traceurRuntime.superConstructor(PlainColorEffect).call(this, context);
      var sources = [plainColorVertex(), plainColorFragment()];
      this.setupShaderSource(sources);
    }
    return ($traceurRuntime.createClass)(PlainColorEffect, {
      beginDraw: function() {
        bg.Math.seed = 1;
      },
      setupVars: function() {
        this._baseColor = new bg.Color(bg.Math.seededRandom(), bg.Math.seededRandom(), bg.Math.seededRandom(), 1);
        var matrixState = bg.base.MatrixState.Current();
        var viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
        this.shader.setMatrix4('inModelMatrix', matrixState.modelMatrixStack.matrixConst);
        this.shader.setMatrix4('inViewMatrix', viewMatrix);
        this.shader.setMatrix4('inProjectionMatrix', matrixState.projectionMatrixStack.matrixConst);
        this.shader.setVector4('inColor', this._baseColor);
        this.shader.setValueInt("inSelectMode", this.material.selectMode);
      }
    }, {}, $__super);
  }(bg.base.Effect);
  bg.manipulation.PlainColorEffect = PlainColorEffect;
  function buildOffscreenPipeline() {
    var offscreenPipeline = new bg.base.Pipeline(this.context);
    var renderSurface = new bg.base.TextureSurface(this.context);
    offscreenPipeline.effect = new bg.manipulation.PlainColorEffect(this.context);
    var colorAttachments = [{
      type: bg.base.RenderSurfaceType.RGBA,
      format: bg.base.RenderSurfaceFormat.UNSIGNED_BYTE
    }, {
      type: bg.base.RenderSurfaceType.DEPTH,
      format: bg.base.RenderSurfaceFormat.RENDERBUFFER
    }];
    renderSurface.create(colorAttachments);
    offscreenPipeline.renderSurface = renderSurface;
    return offscreenPipeline;
  }
  var SelectionHighlight = function($__super) {
    function SelectionHighlight(context) {
      $traceurRuntime.superConstructor(SelectionHighlight).call(this, context);
      this._offscreenPipeline = buildOffscreenPipeline.apply(this);
      this._pipeline = new bg.base.Pipeline(this.context);
      this._pipeline.textureEffect = new bg.manipulation.BorderDetectionEffect(this.context);
      this._matrixState = new bg.base.MatrixState();
      this._drawVisitor = new bg.scene.DrawVisitor(this._offscreenPipeline, this._matrixState);
    }
    return ($traceurRuntime.createClass)(SelectionHighlight, {
      get highlightColor() {
        return this._pipeline.textureEffect.highlightColor;
      },
      set highlightColor(c) {
        this._pipeline.textureEffect.highlightColor = c;
      },
      get borderWidth() {
        return this._pipeline.textureEffect.borderWidth;
      },
      set borderWidth(w) {
        this._pipeline.textureEffect.borderWidth = w;
      },
      drawSelection: function(sceneRoot, camera) {
        var restorePipeline = bg.base.Pipeline.Current();
        var restoreMatrixState = bg.base.MatrixState.Current();
        this._offscreenPipeline.viewport = camera.viewport;
        this._pipeline.viewport = camera.viewport;
        bg.base.Pipeline.SetCurrent(this._offscreenPipeline);
        bg.base.MatrixState.SetCurrent(this._matrixState);
        this._offscreenPipeline.clearBuffers(bg.base.ClearBuffers.COLOR | bg.base.ClearBuffers.DEPTH);
        this._matrixState.projectionMatrixStack.set(camera.projection);
        this._matrixState.viewMatrixStack.set(camera.viewMatrix);
        this._matrixState.modelMatrixStack.identity();
        sceneRoot.accept(this._drawVisitor);
        var texture = this._offscreenPipeline.renderSurface.getTexture(0);
        bg.base.Pipeline.SetCurrent(this._pipeline);
        this._pipeline.drawTexture(texture);
        if (restorePipeline) {
          bg.base.Pipeline.SetCurrent(restorePipeline);
        }
        if (restoreMatrixState) {
          bg.base.MatrixState.SetCurrent(restoreMatrixState);
        }
      }
    }, {}, $__super);
  }(bg.app.ContextObject);
  bg.manipulation.SelectionHighlight = SelectionHighlight;
})();

"use strict";
(function() {
  var Action = {
    ROTATE: 0,
    PAN: 1,
    ZOOM: 2
  };
  function getOrbitAction(cameraCtrl) {
    var left = bg.app.Mouse.LeftButton(),
        middle = bg.app.Mouse.MiddleButton(),
        right = bg.app.Mouse.RightButton();
    switch (true) {
      case left == cameraCtrl._rotateButtons.left && middle == cameraCtrl._rotateButtons.middle && right == cameraCtrl._rotateButtons.right:
        return Action.ROTATE;
      case left == cameraCtrl._panButtons.left && middle == cameraCtrl._panButtons.middle && right == cameraCtrl._panButtons.right:
        return Action.PAN;
      case left == cameraCtrl._zoomButtons.left && middle == cameraCtrl._zoomButtons.middle && right == cameraCtrl._zoomButtons.right:
        return Action.ZOOM;
    }
  }
  function buildPlist(context, vertex, color) {
    var plist = new bg.base.PolyList(context);
    var normal = [];
    var texCoord0 = [];
    var index = [];
    var currentIndex = 0;
    for (var i = 0; i < vertex.length; i += 3) {
      normal.push(0);
      normal.push(0);
      normal.push(1);
      texCoord0.push(0);
      texCoord0.push(0);
      index.push(currentIndex++);
    }
    plist.vertex = vertex;
    plist.normal = normal;
    plist.texCoord0 = texCoord0;
    plist.color = color;
    plist.index = index;
    plist.drawMode = bg.base.DrawMode.LINES;
    plist.build();
    return plist;
  }
  function getGizmo() {
    var x = this.minX;
    var X = this.maxX;
    var y = this.minY;
    var Y = this.maxY;
    var z = this.minZ;
    var Z = this.maxZ;
    var vertex = [x, y, z, X, y, z, X, y, z, X, Y, z, X, Y, z, x, Y, z, x, Y, z, x, y, z, x, y, Z, X, y, Z, X, y, Z, X, Y, Z, X, Y, Z, x, Y, Z, x, Y, Z, x, y, Z, x, y, z, x, y, Z, X, y, z, X, y, Z, X, Y, z, X, Y, Z, x, Y, z, x, Y, Z];
    var color = [];
    for (var i = 0; i < vertex.length; i += 3) {
      color.push(this._limitGizmoColor.r);
      color.push(this._limitGizmoColor.g);
      color.push(this._limitGizmoColor.b);
      color.push(this._limitGizmoColor.a);
    }
    if (!this._plist) {
      this._plist = buildPlist(this.node.context, vertex, color);
    } else {
      this._plist.updateBuffer(bg.base.BufferType.VERTEX, vertex);
      this._plist.updateBuffer(bg.base.BufferType.COLOR, color);
    }
    return this._plist;
  }
  var OrbitCameraController = function($__super) {
    function OrbitCameraController() {
      $traceurRuntime.superConstructor(OrbitCameraController).call(this);
      this._rotateButtons = {
        left: true,
        middle: false,
        right: false
      };
      this._panButtons = {
        left: false,
        middle: false,
        right: true
      };
      this._zoomButtons = {
        left: false,
        middle: true,
        right: false
      };
      this._rotation = new bg.Vector2();
      this._distance = 5;
      this._center = new bg.Vector3();
      this._rotationSpeed = 0.2;
      this._forward = 0;
      this._left = 0;
      this._wheelSpeed = 1;
      this._minFocus = 2;
      this._minPitch = 0.1;
      this._maxPitch = 85.0;
      this._minDistance = 0.4;
      this._maxDistance = 24.0;
      this._maxX = 15;
      this._minX = -15;
      this._minY = 0.1;
      this._maxY = 2.0;
      this._maxZ = 15;
      this._minZ = -15;
      this._displacementSpeed = 0.1;
      this._enabled = true;
      this._keys = {};
      this._showLimitGizmo = true;
      this._limitGizmoColor = bg.Color.Green();
    }
    return ($traceurRuntime.createClass)(OrbitCameraController, {
      setRotateButtons: function(left, middle, right) {
        this._rotateButtons = {
          left: left,
          middle: middle,
          right: right
        };
      },
      setPanButtons: function(left, middle, right) {
        this._panButtons = {
          left: left,
          middle: middle,
          right: right
        };
      },
      setZoomButtons: function(left, middle, right) {
        this._zoomButtons = {
          left: left,
          middle: middle,
          right: right
        };
      },
      get rotation() {
        return this._rotation;
      },
      set rotation(r) {
        this._rotation = r;
      },
      get distance() {
        return this._distance;
      },
      set distance(d) {
        this._distance = d;
      },
      get center() {
        return this._center;
      },
      set center(c) {
        this._center = c;
      },
      get whellSpeed() {
        this._wheelSpeed;
      },
      set wheelSpeed(w) {
        this._wheelSpeed = w;
      },
      get minCameraFocus() {
        return this._minFocus;
      },
      set minCameraFocus(f) {
        this._minFocus = f;
      },
      get minPitch() {
        return this._minPitch;
      },
      set minPitch(p) {
        this._minPitch = p;
      },
      get maxPitch() {
        return this._maxPitch;
      },
      set maxPitch(p) {
        this._maxPitch = p;
      },
      get minDistance() {
        return this._minDistance;
      },
      set minDistance(d) {
        this._minDistance = d;
      },
      get maxDistance() {
        return this._maxDistance;
      },
      set maxDistance(d) {
        this._maxDistance = d;
      },
      get minX() {
        return this._minX;
      },
      get maxX() {
        return this._maxX;
      },
      get minY() {
        return this._minY;
      },
      get maxY() {
        return this._maxY;
      },
      get minZ() {
        return this._minZ;
      },
      get maxZ() {
        return this._maxZ;
      },
      set minX(val) {
        this._minX = val;
      },
      set maxX(val) {
        this._maxX = val;
      },
      set minY(val) {
        this._minY = val;
      },
      set maxY(val) {
        this._maxY = val;
      },
      set minZ(val) {
        this._minZ = val;
      },
      set maxZ(val) {
        this._maxZ = val;
      },
      get displacementSpeed() {
        return this._displacementSpeed;
      },
      set displacementSpeed(s) {
        this._displacementSpeed = s;
      },
      get enabled() {
        return this._enabled;
      },
      set enabled(e) {
        this._enabled = e;
      },
      get showLimitGizmo() {
        return this._showLimitGizmo;
      },
      set showLimitGizmo(l) {
        this._showLimitGizmo = l;
      },
      get limitGizmoColor() {
        return this._limitGizmoColor;
      },
      set limitGizmoColor(c) {
        this._limitGizmoColor = c;
      },
      displayGizmo: function(pipeline, matrixState) {
        if (!this._showLimitGizmo)
          return;
        var plist = getGizmo.apply(this);
        matrixState.modelMatrixStack.push();
        matrixState.modelMatrixStack.identity();
        if (plist) {
          pipeline.draw(plist);
        }
        matrixState.modelMatrixStack.pop();
      },
      serialize: function(componentData, promises, url) {
        $traceurRuntime.superGet(this, OrbitCameraController.prototype, "serialize").call(this, componentData, promises, url);
        componentData.rotateButtons = this._rotateButtons;
        componentData.panButtons = this._panButtons;
        componentData.zoomButtons = this._zoomButtons;
        componentData.rotation = this._rotation.toArray();
        componentData.distance = this._distance;
        componentData.center = this._center.toArray();
        componentData.rotationSpeed = this._rotationSpeed;
        componentData.forward = this._forward;
        componentData.left = this._left;
        componentData.wheelSpeed = this._wheelSpeed;
        componentData.minFocus = this._minFocus;
        componentData.minPitch = this._minPitch;
        componentData.maxPitch = this._maxPitch;
        componentData.minDistance = this._minDistance;
        componentData.maxDistance = this._maxDistance;
        componentData.maxX = this._maxX;
        componentData.minX = this._minX;
        componentData.minY = this._minY;
        componentData.maxY = this._maxY;
        componentData.maxZ = this._maxZ;
        componentData.minZ = this._minZ;
        componentData.displacementSpeed = this._displacementSpeed;
        componentData.enabled = this._enabled;
      },
      deserialize: function(context, componentData, url) {
        this._rotateButtons = componentData.rotateButtons || this._rotateButtons;
        this._panButtons = componentData.panButtons || this._panButtons;
        this._zoomButtons = componentData.zoomButtons || this._zoomButtons;
        this._rotation = new bg.Vector2(componentData.rotation) || this._rotation;
        this._distance = componentData.distance !== undefined ? componentData.distance : this._distance;
        this._center = new bg.Vector3(componentData.center) || this._center;
        this._rotationSpeed = componentData.rotationSpeed !== undefined ? componentData.rotationSpeed : this._rotationSpeed;
        this._forward = componentData.forward !== undefined ? componentData.forward : this._forward;
        this._left = componentData.left !== undefined ? componentData.left : this._left;
        this._wheelSpeed = componentData.wheelSpeed !== undefined ? componentData.wheelSpeed : this._wheelSpeed;
        this._minFocus = componentData.minFocus !== undefined ? componentData.minFocus : this._minFocus;
        this._minPitch = componentData.minPitch !== undefined ? componentData.minPitch : this._minPitch;
        this._maxPitch = componentData.maxPitch !== undefined ? componentData.maxPitch : this._maxPitch;
        this._minDistance = componentData.minDistance !== undefined ? componentData.minDistance : this._minDistance;
        this._maxDistance = componentData.maxDistance !== undefined ? componentData.maxDistance : this._maxDistance;
        this._maxX = componentData.maxX !== undefined ? componentData.maxX : this._maxX;
        this._minX = componentData.minX !== undefined ? componentData.minX : this._minX;
        this._minY = componentData.minY !== undefined ? componentData.minY : this._minY;
        this._maxY = componentData.maxY !== undefined ? componentData.maxY : this._maxY;
        this._maxZ = componentData.maxZ !== undefined ? componentData.maxZ : this._maxZ;
        this._minZ = componentData.minZ !== undefined ? componentData.minZ : this._minZ;
        this._displacementSpeed = componentData.displacementSpeed !== undefined ? componentData.displacementSpeed : this._displacementSpeed;
        this._enabled = componentData.enabled !== undefined ? componentData.enabled : this._enabled;
      },
      frame: function(delta) {
        if (this.transform && this.enabled) {
          var forward = this.transform.matrix.forwardVector;
          var left = this.transform.matrix.leftVector;
          forward.scale(this._forward);
          left.scale(this._left);
          this._center.add(forward).add(left);
          var pitch = this._rotation.x > this._minPitch ? this._rotation.x : this._minPitch;
          pitch = pitch < this._maxPitch ? pitch : this._maxPitch;
          this._rotation.x = pitch;
          this._distance = this._distance > this._minDistance ? this._distance : this._minDistance;
          this._distance = this._distance < this._maxDistance ? this._distance : this._maxDistance;
          if (this._mouseButtonPressed) {
            var displacement = new bg.Vector3();
            if (this._keys[bg.app.SpecialKey.UP_ARROW]) {
              displacement.add(this.transform.matrix.backwardVector);
              bg.app.MainLoop.singleton.windowController.postRedisplay();
            }
            if (this._keys[bg.app.SpecialKey.DOWN_ARROW]) {
              displacement.add(this.transform.matrix.forwardVector);
              bg.app.MainLoop.singleton.windowController.postRedisplay();
            }
            if (this._keys[bg.app.SpecialKey.LEFT_ARROW]) {
              displacement.add(this.transform.matrix.leftVector);
              bg.app.MainLoop.singleton.windowController.postRedisplay();
            }
            if (this._keys[bg.app.SpecialKey.RIGHT_ARROW]) {
              displacement.add(this.transform.matrix.rightVector);
              bg.app.MainLoop.singleton.windowController.postRedisplay();
            }
            displacement.scale(this._displacementSpeed);
            this._center.add(displacement);
          }
          if (this._center.x < this._minX)
            this._center.x = this._minX;
          else if (this._center.x > this._maxX)
            this._center.x = this._maxX;
          if (this._center.y < this._minY)
            this._center.y = this._minY;
          else if (this._center.y > this._maxY)
            this._center.y = this._maxY;
          if (this._center.z < this._minZ)
            this._center.z = this._minZ;
          else if (this._center.z > this._maxZ)
            this._center.z = this._maxZ;
          this.transform.matrix.identity().translate(this._center).rotate(bg.Math.degreesToRadians(this._rotation.y), 0, 1, 0).rotate(bg.Math.degreesToRadians(pitch), -1, 0, 0).translate(0, 0, this._distance);
        }
        if (this.camera) {
          this.camera.focus = this._distance > this._minFocus ? this._distance : this._minFocus;
        }
      },
      mouseDown: function(evt) {
        if (!this.enabled)
          return;
        this._mouseButtonPressed = true;
        this._lastPos = new bg.Vector2(evt.x, evt.y);
      },
      mouseUp: function(evt) {
        this._mouseButtonPressed = false;
      },
      mouseDrag: function(evt) {
        if (this.transform && this._lastPos && this.enabled) {
          var delta = new bg.Vector2(this._lastPos.y - evt.y, this._lastPos.x - evt.x);
          this._lastPos.set(evt.x, evt.y);
          switch (getOrbitAction(this)) {
            case Action.ROTATE:
              delta.x = delta.x * -1;
              this._rotation.add(delta.scale(0.5));
              break;
            case Action.PAN:
              var up = this.transform.matrix.upVector;
              var left = this.transform.matrix.leftVector;
              up.scale(delta.x * -0.001 * this._distance);
              left.scale(delta.y * -0.001 * this._distance);
              this._center.add(up).add(left);
              break;
            case Action.ZOOM:
              this._distance += delta.x * 0.01 * this._distance;
              break;
          }
        }
      },
      mouseWheel: function(evt) {
        if (!this.enabled)
          return;
        var mult = this._distance > 0.01 ? this._distance : 0.01;
        this._distance += evt.delta * 0.001 * mult * this._wheelSpeed;
      },
      touchStart: function(evt) {
        if (!this.enabled)
          return;
        this._lastTouch = evt.touches;
      },
      touchMove: function(evt) {
        if (this._lastTouch.length == evt.touches.length && this.transform && this.enabled) {
          if (this._lastTouch.length == 1) {
            var last = this._lastTouch[0];
            var t = evt.touches[0];
            var delta = new bg.Vector2((last.y - t.y) * -1.0, last.x - t.x);
            this._rotation.add(delta.scale(0.5));
          } else if (this._lastTouch.length == 2) {
            var l0 = this._lastTouch[0];
            var l1 = this._lastTouch[1];
            var t0 = null;
            var t1 = null;
            evt.touches.forEach(function(touch) {
              if (touch.identifier == l0.identifier) {
                t0 = touch;
              } else if (touch.identifier == l1.identifier) {
                t1 = touch;
              }
            });
            var dist0 = Math.round((new bg.Vector2(l0.x, l0.y)).sub(new bg.Vector3(l1.x, l1.y)).magnitude());
            var dist1 = Math.round((new bg.Vector2(t0.x, t0.y)).sub(new bg.Vector3(t1.x, t1.y)).magnitude());
            var delta$__2 = new bg.Vector2(l0.y - t0.y, l1.x - t1.x);
            var up = this.transform.matrix.upVector;
            var left = this.transform.matrix.leftVector;
            up.scale(delta$__2.x * -0.001 * this._distance);
            left.scale(delta$__2.y * -0.001 * this._distance);
            this._center.add(up).add(left);
            this._distance += (dist0 - dist1) * 0.005 * this._distance;
          }
        }
        this._lastTouch = evt.touches;
      },
      keyDown: function(evt) {
        if (!this.enabled)
          return;
        this._keys[evt.key] = true;
        bg.app.MainLoop.singleton.windowController.postRedisplay();
      },
      keyUp: function(evt) {
        if (!this.enabled)
          return;
        this._keys[evt.key] = false;
      }
    }, {
      DisableAll: function(sceneRoot) {
        var ctrl = sceneRoot.component("bg.manipulation.OrbitCameraController");
        if (ctrl) {
          ctrl.enabled = false;
        }
        sceneRoot.children.forEach(function(ch) {
          return OrbitCameraController.DisableAll(ch);
        });
      },
      SetUniqueEnabled: function(orbitCameraController, sceneRoot) {
        OrbitCameraController.DisableAll(sceneRoot);
        orbitCameraController.enabled = true;
      }
    }, $__super);
  }(bg.scene.Component);
  var FPSCameraController = function($__super) {
    function FPSCameraController() {
      $traceurRuntime.superConstructor(FPSCameraController).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(FPSCameraController, {}, {}, $__super);
  }(bg.scene.Component);
  var TargetCameraController = function($__super) {
    function TargetCameraController() {
      $traceurRuntime.superConstructor(TargetCameraController).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(TargetCameraController, {}, {}, $__super);
  }(bg.scene.Component);
  bg.scene.registerComponent(bg.manipulation, OrbitCameraController, "bg.manipulation.OrbitCameraController");
  bg.scene.registerComponent(bg.manipulation, FPSCameraController, "bg.manipulation.FPSCameraController");
  bg.scene.registerComponent(bg.manipulation, TargetCameraController, "bg.manipulation.TargetCameraController");
})();

"use strict";
bg.tools = {};

"use strict";
(function() {
  var BoundingBox = function() {
    function BoundingBox(drawableOrPlist, transformMatrix) {
      this._min = new bg.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
      this._max = new bg.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
      this._center = null;
      this._size = null;
      this._halfSize = null;
      this._vertexArray = [];
      transformMatrix = transformMatrix || bg.Matrix4.Identity();
      if (drawableOrPlist instanceof bg.scene.Drawable) {
        this.addDrawable(drawableOrPlist, transformMatrix);
      } else if (drawableOrPlist instanceof bg.scene.PolyList) {
        this.addPolyList(drawableOrPlist, transformMatrix);
      }
    }
    return ($traceurRuntime.createClass)(BoundingBox, {
      clear: function() {
        this._min = bg.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        this._max = bg.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
        this._center = this._size = this._halfSize = null;
      },
      get min() {
        return this._min;
      },
      get max() {
        return this._max;
      },
      get center() {
        if (!this._center) {
          var s = this.halfSize;
          this._center = bg.Vector3.Add(this.halfSize, this._min);
        }
        return this._center;
      },
      get size() {
        if (!this._size) {
          this._size = bg.Vector3.Sub(this.max, this.min);
        }
        return this._size;
      },
      get halfSize() {
        if (!this._halfSize) {
          this._halfSize = new bg.Vector3(this.size);
          this._halfSize.scale(0.5);
        }
        return this._halfSize;
      },
      addPolyList: function(polyList, trx) {
        this._center = this._size = this._halfSize = null;
        for (var i = 0; i < polyList.vertex.length; i += 3) {
          var vec = trx.multVector(new bg.Vector3(polyList.vertex[i], polyList.vertex[i + 1], polyList.vertex[i + 2]));
          if (vec.x < this._min.x)
            this._min.x = vec.x;
          if (vec.y < this._min.y)
            this._min.y = vec.y;
          if (vec.z < this._min.z)
            this._min.z = vec.z;
          if (vec.x > this._max.x)
            this._max.x = vec.x;
          if (vec.z > this._max.z)
            this._max.z = vec.z;
          if (vec.y > this._max.y)
            this._max.y = vec.y;
        }
      },
      addDrawable: function(drawable, trxBase) {
        var $__1 = this;
        drawable.forEach(function(plist, mat, elemTrx) {
          if (plist.visible) {
            var trx = new bg.Matrix4(trxBase);
            if (elemTrx)
              trx.mult(elemTrx);
            $__1.addPolyList(plist, trx);
          }
        });
      }
    }, {});
  }();
  bg.tools.BoundingBox = BoundingBox;
})();

"use strict";
bg.render = {};

"use strict";
(function() {
  var RenderLayer = function($__super) {
    function RenderLayer(context) {
      var opacityLayer = arguments[1] !== (void 0) ? arguments[1] : bg.base.OpacityLayer.ALL;
      $traceurRuntime.superConstructor(RenderLayer).call(this, context);
      this._pipeline = new bg.base.Pipeline(context);
      this._pipeline.opacityLayer = opacityLayer;
      this._matrixState = bg.base.MatrixState.Current();
      this._drawVisitor = new bg.scene.DrawVisitor(this._pipeline, this._matrixState);
      this._settings = {};
    }
    return ($traceurRuntime.createClass)(RenderLayer, {
      get pipeline() {
        return this._pipeline;
      },
      get opacityLayer() {
        return this._pipeline.opacityLayer;
      },
      get drawVisitor() {
        return this._drawVisitor;
      },
      get matrixState() {
        return this._matrixState;
      },
      set settings(s) {
        this._settings = s;
      },
      get settings() {
        return this._settings;
      },
      draw: function(scene, camera) {}
    }, {}, $__super);
  }(bg.app.ContextObject);
  bg.render.RenderLayer = RenderLayer;
})();

"use strict";
(function() {
  bg.render.RenderPath = {
    FORWARD: 1,
    DEFERRED: 2
  };
  function getRenderPass(context, renderPath) {
    var Factory = null;
    switch (renderPath) {
      case bg.render.RenderPath.FORWARD:
        Factory = bg.render.ForwardRenderPass;
        break;
      case bg.render.RenderPath.DEFERRED:
        if (bg.render.DeferredRenderPass.IsSupported()) {
          Factory = bg.render.DeferredRenderPass;
        } else {
          bg.log("WARNING: Deferred renderer is not supported on this browser");
          Factory = bg.render.ForwardRenderPass;
        }
        break;
    }
    return Factory && new Factory(context);
  }
  bg.render.RaytracerQuality = {
    low: {
      maxSamples: 20,
      rayIncrement: 0.05
    },
    mid: {
      maxSamples: 50,
      rayIncrement: 0.025
    },
    high: {
      maxSamples: 100,
      rayIncrement: 0.0125
    },
    extreme: {
      maxSamples: 200,
      rayIncrement: 0.0062
    }
  };
  bg.render.ShadowType = {
    HARD: bg.base.ShadowType.HARD,
    SOFT: bg.base.ShadowType.SOFT
  };
  bg.render.ShadowMapQuality = {
    low: 512,
    mid: 1024,
    high: 2048,
    extreme: 4096
  };
  var renderSettings = {
    debug: {enabled: false},
    ambientOcclusion: {
      enabled: true,
      sampleRadius: 0.4,
      kernelSize: 16,
      blur: 2,
      maxDistance: 300
    },
    raytracer: {
      enabled: true,
      quality: bg.render.RaytracerQuality.mid
    },
    antialiasing: {enabled: false},
    shadows: {
      quality: bg.render.ShadowMapQuality.mid,
      type: bg.render.ShadowType.SOFT
    }
  };
  var Renderer = function($__super) {
    function Renderer(context) {
      $traceurRuntime.superConstructor(Renderer).call(this, context);
      this._frameVisitor = new bg.scene.FrameVisitor();
      this._settings = renderSettings;
      this._clearColor = bg.Color.Black();
    }
    return ($traceurRuntime.createClass)(Renderer, {
      get isSupported() {
        return false;
      },
      create: function() {
        console.log("ERROR: Error creating renderer. The renderer class must implemente the create() method.");
      },
      get clearColor() {
        return this._clearColor;
      },
      set clearColor(c) {
        this._clearColor = c;
      },
      frame: function(sceneRoot, delta) {
        this._frameVisitor.delta = delta;
        sceneRoot.accept(this._frameVisitor);
      },
      display: function(sceneRoot, camera) {
        this.draw(sceneRoot, camera);
      },
      get settings() {
        return this._settings;
      }
    }, {Create: function(context, renderPath) {
        var result = null;
        if (renderPath == bg.render.RenderPath.DEFERRED) {
          result = new bg.render.DeferredRenderer(context);
        }
        if (renderPath == bg.render.RenderPath.FORWARD || (result && !result.isSupported)) {
          result = new bg.render.ForwardRenderer(context);
        }
        if (result.isSupported) {
          result.create();
        } else {
          throw new Error("No suitable renderer found.");
        }
        return result;
      }}, $__super);
  }(bg.app.ContextObject);
  bg.render.Renderer = Renderer;
})();

"use strict";
(function() {
  function lib() {
    return bg.base.ShaderLibrary.Get();
  }
  var MAX_KERN_OFFSETS = 64;
  var DeferredMixEffect = function($__super) {
    function DeferredMixEffect(context) {
      $traceurRuntime.superConstructor(DeferredMixEffect).call(this, context);
    }
    return ($traceurRuntime.createClass)(DeferredMixEffect, {
      get fragmentShaderSource() {
        if (!this._fragmentShaderSource) {
          this._fragmentShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
          this._fragmentShaderSource.addParameter([{
            name: "inLighting",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inDiffuse",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inPositionMap",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inSSAO",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inReflection",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inSpecularMap",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inMaterial",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inOpaqueDepthMap",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inViewSize",
            dataType: "vec2",
            role: "value"
          }, {
            name: "inSSAOBlur",
            dataType: "int",
            role: "value"
          }, {
            name: "fsTexCoord",
            dataType: "vec2",
            role: "in"
          }]);
          if (bg.Engine.Get().id == "webgl1") {
            this._fragmentShaderSource.addFunction(lib().functions.blur.textureDownsample);
            this._fragmentShaderSource.addFunction(lib().functions.blur.blur);
            this._fragmentShaderSource.addFunction(lib().functions.blur.glowBlur);
            this._fragmentShaderSource.setMainBody("\n\t\t\t\t\tvec4 lighting = clamp(texture2D(inLighting,fsTexCoord),vec4(0.0),vec4(1.0));\n\t\t\t\t\tvec4 diffuse = texture2D(inDiffuse,fsTexCoord);\n\t\t\t\t\tvec4 pos = texture2D(inPositionMap,fsTexCoord);\n\t\t\t\t\tvec4 ssao = blur(inSSAO,fsTexCoord,inSSAOBlur * 20,inViewSize);\n\t\t\t\t\tvec4 material = texture2D(inMaterial,fsTexCoord);\n\n\t\t\t\t\tvec4 specular = texture2D(inSpecularMap,fsTexCoord);\t// The roughness parameter is stored on A component, inside specular map\n\n\t\t\t\t\tfloat roughness = specular.a;\n\t\t\t\t\troughness *= 400.0;\n\t\t\t\t\tvec4 reflect = blur(inReflection,fsTexCoord,int(roughness),inViewSize);\n\n\t\t\t\t\tvec4 opaqueDepth = texture2D(inOpaqueDepthMap,fsTexCoord);\n\t\t\t\t\tif (pos.z<opaqueDepth.z && opaqueDepth.w<1.0) {\n\t\t\t\t\t\tdiscard;\n\t\t\t\t\t}\n\t\t\t\t\telse {\n\t\t\t\t\t\tfloat reflectionAmount = material.b;\n\t\t\t\t\t\tvec3 finalColor = lighting.rgb * (1.0 - reflectionAmount);\n\t\t\t\t\t\tfinalColor += reflect.rgb * reflectionAmount;\n\t\t\t\t\t\tfinalColor *= ssao.rgb;\n\t\t\t\t\t\tgl_FragColor = vec4(finalColor,diffuse.a);\n\t\t\t\t\t}");
          }
        }
        return this._fragmentShaderSource;
      },
      setupVars: function() {
        this.shader.setVector2("inViewSize", new bg.Vector2(this.viewport.width, this.viewport.height));
        this.shader.setTexture("inLighting", this._surface.lightingMap, bg.base.TextureUnit.TEXTURE_0);
        this.shader.setTexture("inDiffuse", this._surface.diffuseMap, bg.base.TextureUnit.TEXTURE_1);
        this.shader.setTexture("inPositionMap", this._surface.positionMap, bg.base.TextureUnit.TEXTURE_2);
        this.shader.setTexture("inSSAO", this._surface.ssaoMap, bg.base.TextureUnit.TEXTURE_3);
        this.shader.setTexture("inReflection", this._surface.reflectionMap, bg.base.TextureUnit.TEXTURE_4);
        this.shader.setTexture("inMaterial", this._surface.materialMap, bg.base.TextureUnit.TEXTURE_5);
        this.shader.setTexture("inSpecularMap", this._surface.specularMap, bg.base.TextureUnit.TEXTURE_6);
        this.shader.setTexture("inOpaqueDepthMap", this._surface.opaqueDepthMap, bg.base.TextureUnit.TEXTURE_7);
        this.shader.setValueInt("inSSAOBlur", this.ssaoBlur);
      },
      set viewport(vp) {
        this._viewport = vp;
      },
      get viewport() {
        return this._viewport;
      },
      set clearColor(c) {
        this._clearColor = c;
      },
      get clearColor() {
        return this._clearColor;
      },
      set ssaoBlur(b) {
        this._ssaoBlur = b;
      },
      get ssaoBlur() {
        return this._ssaoBlur;
      },
      get colorCorrection() {
        if (!this._colorCorrection) {
          this._colorCorrection = {
            hue: 1.0,
            saturation: 1.0,
            lightness: 1.0,
            brightness: 0.5,
            contrast: 0.5
          };
        }
        return this._colorCorrection;
      }
    }, {}, $__super);
  }(bg.base.TextureEffect);
  bg.render.DeferredMixEffect = DeferredMixEffect;
})();

"use strict";
(function() {
  bg.render.SurfaceType = {
    UNDEFINED: 0,
    OPAQUE: 1,
    TRANSPARENT: 2
  };
  var DeferredRenderSurfaces = function($__super) {
    function DeferredRenderSurfaces(context) {
      $traceurRuntime.superConstructor(DeferredRenderSurfaces).call(this, context);
      this._type = bg.render.SurfaceType.UNDEFINED;
      this._gbufferUByteSurface = null;
      this._gbufferFloatSurface = null;
      this._lightingSurface = null;
      this._shadowSurface = null;
      this._ssaoSurface = null;
      this._mixSurface = null;
      this._ssrtSurface = null;
      this._opaqueSurfaces = null;
    }
    return ($traceurRuntime.createClass)(DeferredRenderSurfaces, {
      createOpaqueSurfaces: function() {
        this._type = bg.render.SurfaceType.OPAQUE;
        this.createCommon();
      },
      createTransparentSurfaces: function(opaqueSurfaces) {
        this._type = bg.render.SurfaceType.TRANSPARENT;
        this._opaqueSurfaces = opaqueSurfaces;
        this.createCommon();
      },
      resize: function(newSize) {
        var s = new bg.Vector2(newSize.width, newSize.height);
        this._gbufferUByteSurface.size = s;
        this._gbufferFloatSurface.size = s;
        this._lightingSurface.size = s;
        this._shadowSurface.size = s;
        this._ssaoSurface.size = s;
        this._ssrtSurface.size = s;
        this._mixSurface.size = s;
      },
      get type() {
        return this._type;
      },
      get gbufferUByteSurface() {
        return this._gbufferUByteSurface;
      },
      get gbufferFloatSurface() {
        return this._gbufferFloatSurface;
      },
      get lightingSurface() {
        return this._lightingSurface;
      },
      get shadowSurface() {
        return this._shadowSurface;
      },
      get ssaoSurface() {
        return this._ssaoSurface;
      },
      get ssrtSurface() {
        return this._ssrtSurface;
      },
      get mixSurface() {
        return this._mixSurface;
      },
      get diffuse() {
        return this._gbufferUByteSurface.getTexture(0);
      },
      get specular() {
        return this._gbufferUByteSurface.getTexture(1);
      },
      get normal() {
        return this._gbufferUByteSurface.getTexture(2);
      },
      get material() {
        return this._gbufferUByteSurface.getTexture(3);
      },
      get position() {
        return this._gbufferFloatSurface.getTexture(0);
      },
      get lighting() {
        return this._lightingSurface.getTexture();
      },
      get shadow() {
        return this._shadowSurface.getTexture();
      },
      get ambientOcclusion() {
        return this._ssaoSurface.getTexture();
      },
      get reflection() {
        return this._ssrtSurface.getTexture();
      },
      get mix() {
        return this._mixSurface.getTexture();
      },
      get reflectionColor() {
        return this._type == bg.render.SurfaceType.OPAQUE ? this.lighting : this._opaqueSurfaces.lighting;
      },
      get reflectionDepth() {
        return this._type == bg.render.SurfaceType.OPAQUE ? this.position : this._opaqueSurfaces.position;
      },
      get mixDepthMap() {
        return this._type == bg.render.SurfaceType.OPAQUE ? this.position : this._opaqueSurfaces.position;
      },
      createCommon: function() {
        var ctx = this.context;
        this._gbufferUByteSurface = new bg.base.TextureSurface(ctx);
        this._gbufferUByteSurface.create([{
          type: bg.base.RenderSurfaceType.RGBA,
          format: bg.base.RenderSurfaceFormat.UNSIGNED_BYTE
        }, {
          type: bg.base.RenderSurfaceType.RGBA,
          format: bg.base.RenderSurfaceFormat.UNSIGNED_BYTE
        }, {
          type: bg.base.RenderSurfaceType.RGBA,
          format: bg.base.RenderSurfaceFormat.UNSIGNED_BYTE
        }, {
          type: bg.base.RenderSurfaceType.RGBA,
          format: bg.base.RenderSurfaceFormat.UNSIGNED_BYTE
        }, {
          type: bg.base.RenderSurfaceType.DEPTH,
          format: bg.base.RenderSurfaceFormat.RENDERBUFFER
        }]);
        this._gbufferUByteSurface.resizeOnViewportChanged = false;
        this._gbufferFloatSurface = new bg.base.TextureSurface(ctx);
        this._gbufferFloatSurface.create([{
          type: bg.base.RenderSurfaceType.RGBA,
          format: bg.base.RenderSurfaceFormat.FLOAT
        }, {
          type: bg.base.RenderSurfaceType.DEPTH,
          format: bg.base.RenderSurfaceFormat.RENDERBUFFER
        }]);
        this._gbufferFloatSurface.resizeOnViewportChanged = false;
        this._lightingSurface = new bg.base.TextureSurface(ctx);
        this._lightingSurface.create([{
          type: bg.base.RenderSurfaceType.RGBA,
          format: bg.base.RenderSurfaceFormat.FLOAT
        }, {
          type: bg.base.RenderSurfaceType.DEPTH,
          format: bg.base.RenderSurfaceFormat.RENDERBUFFER
        }]);
        this._lightingSurface.resizeOnViewportChanged = false;
        this._shadowSurface = new bg.base.TextureSurface(ctx);
        this._shadowSurface.create([{
          type: bg.base.RenderSurfaceType.RGBA,
          format: bg.base.RenderSurfaceFormat.UNSIGNED_BYTE
        }, {
          type: bg.base.RenderSurfaceType.DEPTH,
          format: bg.base.RenderSurfaceFormat.RENDERBUFFER
        }]);
        this._shadowSurface.resizeOnViewportChanged = false;
        this._ssaoSurface = new bg.base.TextureSurface(ctx);
        this._ssaoSurface.create();
        this._ssaoSurface.resizeOnViewportChanged = false;
        this._ssrtSurface = new bg.base.TextureSurface(ctx);
        this._ssrtSurface.create();
        this._ssrtSurface.resizeOnViewportChanged = false;
        this._mixSurface = new bg.base.TextureSurface(ctx);
        this._mixSurface.create();
        this._mixSurface.resizeOnViewportChanged = false;
      }
    }, {}, $__super);
  }(bg.app.ContextObject);
  bg.render.DeferredRenderSurfaces = DeferredRenderSurfaces;
  function newPL(ctx, fx, surface, opacityLayer) {
    var pl = new bg.base.Pipeline(ctx);
    pl.renderSurface = surface;
    if (opacityLayer !== undefined) {
      pl.opacityLayer = opacityLayer;
      pl.effect = fx;
    } else {
      pl.textureEffect = fx;
    }
    return pl;
  }
  function createCommon(deferredRenderLayer) {
    var ctx = deferredRenderLayer.context;
    var s = deferredRenderLayer._surfaces;
    var opacityLayer = deferredRenderLayer._opacityLayer;
    deferredRenderLayer._gbufferUbyte = newPL(ctx, new bg.render.GBufferEffect(ctx), s.gbufferUByteSurface, opacityLayer);
    deferredRenderLayer._gbufferFloat = newPL(ctx, new bg.render.PositionGBufferEffect(ctx), s.gbufferFloatSurface, opacityLayer);
    deferredRenderLayer._shadow = newPL(ctx, new bg.render.ShadowEffect(ctx), s.shadowSurface, bg.base.OpacityLayer.ALL);
    deferredRenderLayer._lighting = newPL(ctx, new bg.render.LightingEffect(ctx), s.lightingSurface);
    deferredRenderLayer._ssao = newPL(ctx, new bg.render.SSAOEffect(ctx), s.ssaoSurface);
    deferredRenderLayer._ssao.clearColor = bg.Color.White();
    deferredRenderLayer._ssrt = newPL(ctx, new bg.render.SSRTEffect(ctx), s.ssrtSurface);
    var matrixState = deferredRenderLayer.matrixState;
    deferredRenderLayer.ubyteVisitor = new bg.scene.DrawVisitor(deferredRenderLayer._gbufferUbyte, matrixState);
    deferredRenderLayer.floatVisitor = new bg.scene.DrawVisitor(deferredRenderLayer._gbufferFloat, matrixState);
    deferredRenderLayer.shadowVisitor = new bg.scene.DrawVisitor(deferredRenderLayer._shadow, matrixState);
    deferredRenderLayer._mix = newPL(ctx, new bg.render.DeferredMixEffect(ctx), s.mixSurface);
  }
  var DeferredRenderLayer = function($__super) {
    function DeferredRenderLayer(context) {
      $traceurRuntime.superConstructor(DeferredRenderLayer).call(this, context);
    }
    return ($traceurRuntime.createClass)(DeferredRenderLayer, {
      createOpaque: function() {
        this._opacityLayer = bg.base.OpacityLayer.OPAQUE;
        this._surfaces = new bg.render.DeferredRenderSurfaces(this.context);
        this._surfaces.createOpaqueSurfaces();
        createCommon(this);
      },
      createTransparent: function(opaqueMaps) {
        this._opacityLayer = bg.base.OpacityLayer.TRANSPARENT;
        this._surfaces = new bg.render.DeferredRenderSurfaces(this.context);
        this._surfaces.createTransparentSurfaces(opaqueMaps);
        createCommon(this);
        this._gbufferUbyte.blend = true;
        this._gbufferUbyte.setBlendMode = bg.base.BlendMode.NORMAL;
        this._gbufferUbyte.clearColor = bg.Color.Transparent();
        this._lighting.clearColor = bg.Color.Black();
        this.pipeline.clearColor = bg.Color.Transparent();
      },
      set shadowMap(sm) {
        this._shadowMap = sm;
      },
      get shadowMap() {
        return this._shadowMap;
      },
      get pipeline() {
        return this._mix;
      },
      get texture() {
        return this.maps.mix;
      },
      draw: function(scene, camera) {
        this.matrixState.projectionMatrixStack.set(camera.projection);
        this.matrixState.viewMatrixStack.set(camera.viewMatrix);
        this.matrixState.modelMatrixStack.identity();
        this.performDraw(scene, camera);
      },
      get maps() {
        return this._surfaces;
      },
      resize: function(camera) {
        var vp = camera.viewport;
        this.maps.resize(new bg.Size2D(vp.width, vp.height));
      },
      performDraw: function(scene, camera) {
        var $__2 = this;
        bg.base.Pipeline.SetCurrent(this._gbufferUbyte);
        this._gbufferUbyte.viewport = camera.viewport;
        this._gbufferUbyte.clearBuffers();
        scene.accept(this.ubyteVisitor);
        bg.base.Pipeline.SetCurrent(this._gbufferFloat);
        this._gbufferFloat.viewport = camera.viewport;
        this._gbufferFloat.clearBuffers();
        scene.accept(this.floatVisitor);
        this._lighting.viewport = camera.viewport;
        this._lighting.clearcolor = bg.Color.White();
        bg.base.Pipeline.SetCurrent(this._lighting);
        this._lighting.clearBuffers(bg.base.ClearBuffers.COLOR_DEPTH);
        this._lighting.blendMode = bg.base.BlendMode.ADD;
        this._lighting.blend = true;
        this._shadow.viewport = camera.viewport;
        var lightIndex = 0;
        bg.scene.Light.GetActiveLights().forEach(function(lightComponent) {
          if (lightComponent.light && lightComponent.light.enabled && lightComponent.node && lightComponent.node.enabled) {
            if (lightComponent.light.type == bg.base.LightType.DIRECTIONAL) {
              $__2._shadowMap.update(scene, camera, lightComponent.light, lightComponent.transform, bg.base.ShadowCascade.NEAR);
              bg.base.Pipeline.SetCurrent($__2._shadow);
              $__2._shadow.viewport = camera.viewport;
              $__2._shadow.clearBuffers();
              $__2._shadow.effect.light = lightComponent.light;
              $__2._shadow.effect.shadowMap = $__2._shadowMap;
              scene.accept($__2.shadowVisitor);
            } else if (lightComponent.light.type == bg.base.LightType.SPOT) {
              $__2._shadowMap.shadowType = $__2.settings.shadows.type;
              $__2._shadowMap.update(scene, camera, lightComponent.light, lightComponent.transform);
              bg.base.Pipeline.SetCurrent($__2._shadow);
              $__2._shadow.viewport = camera.viewport;
              $__2._shadow.clearBuffers();
              $__2._shadow.effect.light = lightComponent.light;
              $__2._shadow.effect.shadowMap = $__2._shadowMap;
              scene.accept($__2.shadowVisitor);
            }
            bg.base.Pipeline.SetCurrent($__2._lighting);
            $__2._lighting.textureEffect.lightEmissionFactor = lightIndex == 0 ? 10 : 0;
            $__2._lighting.textureEffect.light = lightComponent.light;
            $__2._lighting.textureEffect.lightTransform = lightComponent.transform;
            $__2._lighting.textureEffect.shadowMap = $__2.maps.shadow;
            $__2._lighting.drawTexture($__2.maps);
            ++lightIndex;
          }
        });
        var renderSSAO = this.settings.ambientOcclusion.enabled;
        var renderSSRT = this.settings.raytracer.enabled;
        var vp = new bg.Viewport(camera.viewport);
        this._ssao.textureEffect.enabled = renderSSAO;
        this._ssao.textureEffect.settings.kernelSize = this.settings.ambientOcclusion.kernelSize;
        this._ssao.textureEffect.settings.sampleRadius = this.settings.ambientOcclusion.sampleRadius;
        this._ssao.textureEffect.settings.maxDistance = this.settings.ambientOcclusion.maxDistance;
        if (renderSSAO) {
          bg.base.Pipeline.SetCurrent(this._ssao);
          this._ssao.viewport = camera.viewport;
          this._ssao.clearBuffers();
          this._ssao.textureEffect.viewport = camera.viewport;
          this._ssao.textureEffect.projectionMatrix = camera.projection;
          this._ssao.drawTexture(this.maps);
        }
        bg.base.Pipeline.SetCurrent(this._ssrt);
        if (renderSSRT) {
          this._ssrt.viewport = vp;
          this._ssrt.clearBuffers();
          this._ssrt.textureEffect.quality = this.settings.raytracer.quality;
          var cameraTransform = camera.node.component("bg.scene.Transform");
          if (cameraTransform) {
            var viewProjection = new bg.Matrix4(camera.projection);
            viewProjection.mult(camera.viewMatrix);
            this._ssrt.textureEffect.cameraPosition = viewProjection.multVector(cameraTransform.matrix.position).xyz;
          }
          this._ssrt.textureEffect.projectionMatrix = camera.projection;
          this._ssrt.textureEffect.rayFailColor = this.settings.raytracer.clearColor || bg.Color.Black();
          this._ssrt.textureEffect.basic = this.settings.raytracer.basicReflections || false;
          this._ssrt.drawTexture(this.maps);
        }
        bg.base.Pipeline.SetCurrent(this.pipeline);
        this.pipeline.viewport = camera.viewport;
        this.pipeline.clearBuffers();
        this.pipeline.textureEffect.viewport = camera.viewport;
        this.pipeline.textureEffect.ssaoBlur = renderSSAO ? this.settings.ambientOcclusion.blur : 1;
        this.pipeline.drawTexture({
          lightingMap: this.maps.lighting,
          diffuseMap: this.maps.diffuse,
          positionMap: this.maps.position,
          ssaoMap: renderSSAO ? this.maps.ambientOcclusion : bg.base.TextureCache.WhiteTexture(this.context),
          reflectionMap: renderSSRT ? this.maps.reflection : this.maps.lighting,
          specularMap: this.maps.specular,
          materialMap: this.maps.material,
          opaqueDepthMap: this.maps.mixDepthMap
        });
      }
    }, {}, $__super);
  }(bg.render.RenderLayer);
  bg.render.DeferredRenderLayer = DeferredRenderLayer;
})();

"use strict";
(function() {
  var DeferredRenderer = function($__super) {
    function DeferredRenderer(context) {
      $traceurRuntime.superConstructor(DeferredRenderer).call(this, context);
      this._size = new bg.Size2D(0);
    }
    return ($traceurRuntime.createClass)(DeferredRenderer, {
      get isSupported() {
        return bg.base.RenderSurface.MaxColorAttachments() > 5 && bg.base.RenderSurface.SupportFormat(bg.base.RenderSurfaceFormat.FLOAT) && bg.base.RenderSurface.SupportType(bg.base.RenderSurfaceType.DEPTH);
      },
      get pipeline() {
        return this._pipeline;
      },
      create: function() {
        var ctx = this.context;
        this._opaqueLayer = new bg.render.DeferredRenderLayer(ctx);
        this._opaqueLayer.settings = this.settings;
        this._opaqueLayer.createOpaque();
        this._transparentLayer = new bg.render.DeferredRenderLayer(ctx);
        this._transparentLayer.settings = this.settings;
        this._transparentLayer.createTransparent(this._opaqueLayer.maps);
        this._shadowMap = new bg.base.ShadowMap(ctx);
        this._shadowMap.size = new bg.Vector2(2048);
        this._opaqueLayer.shadowMap = this._shadowMap;
        this._transparentLayer.shadowMap = this._shadowMap;
        var mixSurface = new bg.base.TextureSurface(ctx);
        mixSurface.create();
        this._mixPipeline = new bg.base.Pipeline(ctx);
        this._mixPipeline.textureEffect = new bg.render.RendererMixEffect(ctx);
        this._mixPipeline.renderSurface = mixSurface;
        this._pipeline = new bg.base.Pipeline(ctx);
        this._pipeline.textureEffect = new bg.render.PostprocessEffect(ctx);
      },
      draw: function(scene, camera) {
        if (this._shadowMap.size.x != this.settings.shadows.quality) {
          this._shadowMap.size = new bg.Vector2(this.settings.shadows.quality);
        }
        var vp = camera.viewport;
        var aa = this.settings.antialiasing || {};
        var scaledWidth = vp.width;
        var scaledHeight = vp.height;
        if (aa.enabled) {
          var maxSize = aa.maxTextureSize || 4096;
          var ratio = vp.aspectRatio;
          scaledWidth = vp.width * 2;
          scaledHeight = vp.height * 2;
          if (ratio > 1 && scaledWidth > maxSize) {
            scaledWidth = maxSize;
            scaledHeight = maxSize / ratio;
          } else if (scaledHeight > maxSize) {
            scaledHeight = maxSize;
            scaledWidth = maxSize * ratio;
          }
        }
        var scaledViewport = new bg.Viewport(0, 0, scaledWidth, scaledHeight);
        camera.viewport = scaledViewport;
        var mainLight = null;
        this._opaqueLayer.clearColor = this.clearColor;
        if (this._size.width != camera.viewport.width || this._size.height != camera.viewport.height) {
          this._opaqueLayer.resize(camera);
          this._transparentLayer.resize(camera);
        }
        this._opaqueLayer.draw(scene, camera);
        this._transparentLayer.draw(scene, camera);
        bg.base.Pipeline.SetCurrent(this._mixPipeline);
        this._mixPipeline.viewport = camera.viewport;
        this._mixPipeline.clearColor = bg.Color.Black();
        this._mixPipeline.clearBuffers();
        this._mixPipeline.drawTexture({
          opaque: this._opaqueLayer.texture,
          transparent: this._transparentLayer.texture,
          transparentNormal: this._transparentLayer.maps.normal,
          opaqueDepth: this._opaqueLayer.maps.position,
          transparentDepth: this._transparentLayer.maps.position
        });
        bg.base.Pipeline.SetCurrent(this.pipeline);
        this.pipeline.viewport = vp;
        this.pipeline.clearColor = this.clearColor;
        this.pipeline.clearBuffers();
        this.pipeline.drawTexture({texture: this._mixPipeline.renderSurface.getTexture(0)});
        camera.viewport = vp;
      },
      getImage: function(scene, camera, width, height) {
        var prevViewport = camera.viewport;
        camera.viewport = new bg.Viewport(0, 0, width, height);
        this.draw(scene, camera);
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        var buffer = this.pipeline.renderSurface.readBuffer(new bg.Viewport(0, 0, width, height));
        var imgData = ctx.createImageData(width, height);
        var len = width * 4;
        for (var i = 0; i < height; ++i) {
          for (var j = 0; j < len; j += 4) {
            var srcRow = i * width * 4;
            var dstRow = (height - i) * width * 4;
            imgData.data[dstRow + j + 0] = buffer[srcRow + j + 0];
            imgData.data[dstRow + j + 1] = buffer[srcRow + j + 1];
            imgData.data[dstRow + j + 2] = buffer[srcRow + j + 2];
            imgData.data[dstRow + j + 3] = buffer[srcRow + j + 3];
          }
        }
        ctx.putImageData(imgData, 0, 0);
        var img = canvas.toDataURL('image/jpeg');
        camera.viewport = prevViewport;
        this.viewport = prevViewport;
        this.draw(scene, camera);
        return img;
      }
    }, {}, $__super);
  }(bg.render.Renderer);
  bg.render.DeferredRenderer = DeferredRenderer;
})();

"use strict";
(function() {
  var ForwardRenderLayer = function($__super) {
    function ForwardRenderLayer(context, opacityLayer) {
      $traceurRuntime.superConstructor(ForwardRenderLayer).call(this, context, opacityLayer);
      this._pipeline.effect = new bg.base.ForwardEffect(context);
      this._pipeline.opacityLayer = opacityLayer;
      this._lightComponent = null;
      this._lightComponents = [];
      if (opacityLayer == bg.base.OpacityLayer.TRANSPARENT) {
        this._pipeline.buffersToClear = bg.base.ClearBuffers.NONE;
        this._pipeline.blend = true;
        this._pipeline.blendMode = bg.base.BlendMode.NORMAL;
      }
    }
    return ($traceurRuntime.createClass)(ForwardRenderLayer, {
      set lightComponent(light) {
        this._lightComponent = light;
      },
      get lightComponent() {
        return this._lightComponent;
      },
      setLightSources: function(lightComponents) {
        this._lightComponents = lightComponents;
      },
      set shadowMap(sm) {
        this._shadowMap = sm;
      },
      get shadowMap() {
        return this._shadowMap;
      },
      draw: function(scene, camera) {
        bg.base.Pipeline.SetCurrent(this._pipeline);
        this._pipeline.viewport = camera.viewport;
        if (camera.clearBuffers != 0) {
          this._pipeline.clearBuffers();
        }
        this.matrixState.projectionMatrixStack.set(camera.projection);
        this.matrixState.viewMatrixStack.set(camera.viewMatrix);
        bg.base.Pipeline.SetCurrent(this._pipeline);
        this._pipeline.viewport = camera.viewport;
        this.willDraw(scene, camera);
        this.performDraw(scene, camera);
      },
      willDraw: function(scene, camera) {
        var $__1 = this;
        if (this._lightComponent) {
          this._pipeline.effect.light = this._lightComponent.light;
          this._pipeline.effect.lightTransform = this._lightComponent.transform;
          this._pipeline.effect.shadowMap = this._shadowMap;
        } else if (this._lightComponents) {
          this._pipeline.effect.lightArray.reset();
          this._lightComponents.forEach(function(comp) {
            $__1._pipeline.effect.lightArray.push(comp.light, comp.transform);
          });
          this._pipeline.effect.shadowMap = this._shadowMap;
        }
      },
      performDraw: function(scene, camera) {
        this._pipeline.viewport = camera.viewport;
        scene.accept(this.drawVisitor);
      }
    }, {}, $__super);
  }(bg.render.RenderLayer);
  bg.render.ForwardRenderLayer = ForwardRenderLayer;
})();

"use strict";
(function() {
  var ForwardRenderer = function($__super) {
    function ForwardRenderer(context) {
      $traceurRuntime.superConstructor(ForwardRenderer).call(this, context);
    }
    return ($traceurRuntime.createClass)(ForwardRenderer, {
      get isSupported() {
        return true;
      },
      create: function() {
        var ctx = this.context;
        this._transparentLayer = new bg.render.ForwardRenderLayer(ctx, bg.base.OpacityLayer.TRANSPARENT);
        this._opaqueLayer = new bg.render.ForwardRenderLayer(ctx, bg.base.OpacityLayer.OPAQUE);
        this._shadowMap = new bg.base.ShadowMap(ctx);
        this._shadowMap.size = new bg.Vector2(2048);
        this.settings.shadows.cascade = bg.base.ShadowCascade.NEAR;
      },
      draw: function(scene, camera) {
        var shadowLight = null;
        var lightSources = [];
        bg.scene.Light.GetActiveLights().some(function(lightComponent, index) {
          if (index >= bg.base.MAX_FORWARD_LIGHTS)
            return true;
          if (lightComponent.light && lightComponent.light.enabled) {
            lightSources.push(lightComponent);
            if (lightComponent.light.type != bg.base.LightType.POINT && lightComponent.light.castShadows) {
              shadowLight = lightComponent;
            }
          }
        });
        if (shadowLight) {
          if (this._shadowMap.size.x != this.settings.shadows.quality) {
            this._shadowMap.size = new bg.Vector2(this.settings.shadows.quality);
          }
          this._shadowMap.update(scene, camera, shadowLight.light, shadowLight.transform, this.settings.shadows.cascade);
        }
        if (lightSources.length) {
          this._opaqueLayer.setLightSources(lightSources);
          this._opaqueLayer.shadowMap = this._shadowMap;
          this._transparentLayer.setLightSources(lightSources);
          this._transparentLayer.shadowMap = this._shadowMap;
        }
        this._opaqueLayer.pipeline.clearColor = this.clearColor;
        this._opaqueLayer.draw(scene, camera);
        this._transparentLayer.draw(scene, camera);
      },
      getImage: function(scene, camera, width, height) {
        var prevViewport = camera.viewport;
        camera.viewport = new bg.Viewport(0, 0, width, height);
        this.draw(scene, camera);
        this.draw(scene, camera);
        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        var buffer = this._opaqueLayer.pipeline.renderSurface.readBuffer(new bg.Viewport(0, 0, width, height));
        var imgData = ctx.createImageData(width, height);
        var len = width * 4;
        for (var i = 0; i < height; ++i) {
          for (var j = 0; j < len; j += 4) {
            var srcRow = i * width * 4;
            var dstRow = (height - i) * width * 4;
            imgData.data[dstRow + j + 0] = buffer[srcRow + j + 0];
            imgData.data[dstRow + j + 1] = buffer[srcRow + j + 1];
            imgData.data[dstRow + j + 2] = buffer[srcRow + j + 2];
            imgData.data[dstRow + j + 3] = buffer[srcRow + j + 3];
          }
        }
        ctx.putImageData(imgData, 0, 0);
        var img = canvas.toDataURL('image/jpeg');
        camera.viewport = prevViewport;
        this._opaqueLayer.viewport = prevViewport;
        this._transparentLayer.viewport = prevViewport;
        return img;
      }
    }, {}, $__super);
  }(bg.render.Renderer);
  bg.render.ForwardRenderer = ForwardRenderer;
})();

"use strict";
(function() {
  var s_ubyteGbufferVertex = null;
  var s_ubyteGbufferFragment = null;
  var s_floatGbufferVertex = null;
  var s_floatGbufferFragment = null;
  function lib() {
    return bg.base.ShaderLibrary.Get();
  }
  var deferredShaders = {
    gbuffer_ubyte_vertex: function() {
      if (!s_ubyteGbufferVertex) {
        s_ubyteGbufferVertex = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
        s_ubyteGbufferVertex.addParameter([lib().inputs.buffers.vertex, lib().inputs.buffers.normal, lib().inputs.buffers.tangent, lib().inputs.buffers.tex0, lib().inputs.buffers.tex1]);
        s_ubyteGbufferVertex.addParameter(lib().inputs.matrix.all);
        s_ubyteGbufferVertex.addParameter([{
          name: "fsPosition",
          dataType: "vec3",
          role: "out"
        }, {
          name: "fsTex0Coord",
          dataType: "vec2",
          role: "out"
        }, {
          name: "fsTex1Coord",
          dataType: "vec2",
          role: "out"
        }, {
          name: "fsNormal",
          dataType: "vec3",
          role: "out"
        }, {
          name: "fsTangent",
          dataType: "vec3",
          role: "out"
        }, {
          name: "fsBitangent",
          dataType: "vec3",
          role: "out"
        }]);
        if (bg.Engine.Get().id == "webgl1") {
          s_ubyteGbufferVertex.setMainBody("\n\t\t\t\t\tvec4 viewPos = inViewMatrix * inModelMatrix * vec4(inVertex,1.0);\n\t\t\t\t\tgl_Position = inProjectionMatrix * viewPos;\n\t\t\t\t\t\n\t\t\t\t\tfsNormal = normalize((inNormalMatrix  * vec4(inNormal,1.0)).xyz);\n\t\t\t\t\tfsTangent = normalize((inNormalMatrix * vec4(inTangent,1.0)).xyz);\n\t\t\t\t\tfsBitangent = cross(fsNormal,fsTangent);\n\t\t\t\t\t\n\t\t\t\t\tfsTex0Coord = inTex0;\n\t\t\t\t\tfsTex1Coord = inTex1;\n\t\t\t\t\tfsPosition = viewPos.xyz;");
        }
      }
      return s_ubyteGbufferVertex;
    },
    gbuffer_ubyte_fragment: function() {
      if (!s_ubyteGbufferFragment) {
        s_ubyteGbufferFragment = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
        s_ubyteGbufferFragment.appendHeader("#extension GL_EXT_draw_buffers : require");
        s_ubyteGbufferFragment.addParameter([{
          name: "fsPosition",
          dataType: "vec3",
          role: "in"
        }, {
          name: "fsTex0Coord",
          dataType: "vec2",
          role: "in"
        }, {
          name: "fsTex1Coord",
          dataType: "vec2",
          role: "in"
        }, {
          name: "fsNormal",
          dataType: "vec3",
          role: "in"
        }, {
          name: "fsTangent",
          dataType: "vec3",
          role: "in"
        }, {
          name: "fsBitangent",
          dataType: "vec3",
          role: "int"
        }]);
        s_ubyteGbufferFragment.addParameter(lib().inputs.material.all);
        s_ubyteGbufferFragment.addFunction(lib().functions.materials.all);
        if (bg.Engine.Get().id == "webgl1") {
          s_ubyteGbufferFragment.setMainBody("\n\t\t\t\t\t\tvec4 lightMap = samplerColor(inLightMap,fsTex1Coord,inLightMapOffset,inLightMapScale);\n\t\t\t\t\t\tvec4 diffuse = samplerColor(inTexture,fsTex0Coord,inTextureOffset,inTextureScale) * inDiffuseColor * lightMap;\n\t\t\t\t\t\tif (diffuse.a>=inAlphaCutoff) {\n\t\t\t\t\t\t\tvec3 normal = samplerNormal(inNormalMap,fsTex0Coord,inNormalMapOffset,inNormalMapScale);\n\t\t\t\t\t\t\tnormal = combineNormalWithMap(fsNormal,fsTangent,fsBitangent,normal);\n\t\t\t\t\t\t\tvec4 specular = specularColor(inSpecularColor,inShininessMask,fsTex0Coord,inTextureOffset,inTextureScale,\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tinShininessMaskChannel,inShininessMaskInvert);\n\t\t\t\t\t\t\tfloat lightEmission = applyTextureMask(inLightEmission,\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tinLightEmissionMask,fsTex0Coord,inTextureOffset,inTextureScale,\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tinLightEmissionMaskChannel,inLightEmissionMaskInvert);\n\t\t\t\t\t\t\t\n\t\t\t\t\t\t\tfloat reflectionMask = applyTextureMask(inReflection,\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tinReflectionMask,fsTex0Coord,inTextureOffset,inTextureScale,\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tinReflectionMaskChannel,inReflectionMaskInvert);\n\t\t\t\t\t\t\t\n\t\t\t\t\t\t\tfloat roughnessMask = applyTextureMask(inRoughness,\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tinRoughnessMask,fsTex0Coord,inTextureOffset,inTextureScale,\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tinRoughnessMaskChannel,inRoughnessMaskInvert);\n\n\t\t\t\t\t\t\tgl_FragData[0] = diffuse;\n\t\t\t\t\t\t\tgl_FragData[1] = vec4(specular.rgb,roughnessMask); // Store roughness on A component of specular\n\t\t\t\t\t\t\tgl_FragData[2] = vec4(normal * 0.5 + 0.5, inUnlit ? 0.0 : 1.0);\t// Store !unlit parameter on A component of normal\n\t\t\t\t\t\t\tgl_FragData[3] = vec4(lightEmission,inShininess/255.0,reflectionMask,float(inCastShadows));\n\t\t\t\t\t\t}\n\t\t\t\t\t\telse {\n\t\t\t\t\t\t\tdiscard;\n\t\t\t\t\t\t}");
        }
      }
      return s_ubyteGbufferFragment;
    },
    gbuffer_float_vertex: function() {
      if (!s_floatGbufferVertex) {
        s_floatGbufferVertex = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
        s_floatGbufferVertex.addParameter([lib().inputs.buffers.vertex, lib().inputs.buffers.tex0, null, lib().inputs.matrix.model, lib().inputs.matrix.view, lib().inputs.matrix.projection, null, {
          name: "fsPosition",
          dataType: "vec4",
          role: "out"
        }, {
          name: "fsTex0Coord",
          dataType: "vec2",
          role: "out"
        }]);
        if (bg.Engine.Get().id == "webgl1") {
          s_floatGbufferVertex.setMainBody("\n\t\t\t\t\tfsPosition = inViewMatrix * inModelMatrix * vec4(inVertex,1.0);\n\t\t\t\t\tfsTex0Coord = inTex0;\n\t\t\t\t\t\n\t\t\t\t\tgl_Position = inProjectionMatrix * fsPosition;");
        }
      }
      return s_floatGbufferVertex;
    },
    gbuffer_float_fragment: function() {
      if (!s_floatGbufferFragment) {
        s_floatGbufferFragment = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
        s_floatGbufferFragment.addParameter([lib().inputs.material.texture, lib().inputs.material.textureScale, lib().inputs.material.textureOffset, null, {
          name: "fsPosition",
          dataType: "vec4",
          role: "in"
        }, {
          name: "fsTex0Coord",
          dataType: "vec2",
          role: "in"
        }]);
        s_floatGbufferFragment.addFunction(lib().functions.materials.samplerColor);
        if (bg.Engine.Get().id == "webgl1") {
          s_floatGbufferFragment.setMainBody("\n\t\t\t\t\tfloat alpha = samplerColor(inTexture,fsTex0Coord,inTextureOffset,inTextureScale).a;\n\t\t\t\t\t// TODO: texture alpha\n\t\t\t\t\t// if (a<alphaCutoff....etc)\n\t\t\t\t\t\n\t\t\t\t\tgl_FragColor = vec4(fsPosition.xyz,gl_FragCoord.z);");
        }
      }
      return s_floatGbufferFragment;
    }
  };
  var GBufferEffect = function($__super) {
    function GBufferEffect(context) {
      $traceurRuntime.superConstructor(GBufferEffect).call(this, context);
      var ubyte_shaders = [deferredShaders.gbuffer_ubyte_vertex(), deferredShaders.gbuffer_ubyte_fragment()];
      this._material = null;
      this.setupShaderSource(ubyte_shaders);
    }
    return ($traceurRuntime.createClass)(GBufferEffect, {
      get material() {
        return this._material;
      },
      set material(m) {
        this._material = m;
      },
      setupVars: function() {
        if (this.material) {
          var matrixState = bg.base.MatrixState.Current();
          var viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
          this.shader.setMatrix4('inModelMatrix', matrixState.modelMatrixStack.matrixConst);
          this.shader.setMatrix4('inViewMatrix', viewMatrix);
          this.shader.setMatrix4('inProjectionMatrix', matrixState.projectionMatrixStack.matrixConst);
          this.shader.setMatrix4('inNormalMatrix', matrixState.normalMatrix);
          this.shader.setMatrix4('inViewMatrixInv', matrixState.viewMatrixInvert);
          var texture = this.material.texture || bg.base.TextureCache.WhiteTexture(this.context);
          var lightMap = this.material.lightmap || bg.base.TextureCache.WhiteTexture(this.context);
          var normalMap = this.material.normalMap || bg.base.TextureCache.NormalTexture(this.context);
          this.shader.setVector4('inDiffuseColor', this.material.diffuse);
          this.shader.setVector4('inSpecularColor', this.material.specular);
          this.shader.setValueFloat('inShininess', this.material.shininess);
          this.shader.setValueFloat('inLightEmission', this.material.lightEmission);
          this.shader.setValueFloat('inAlphaCutoff', this.material.alphaCutoff);
          this.shader.setTexture('inTexture', texture, bg.base.TextureUnit.TEXTURE_0);
          this.shader.setVector2('inTextureOffset', this.material.textureOffset);
          this.shader.setVector2('inTextureScale', this.material.textureScale);
          this.shader.setTexture('inLightMap', lightMap, bg.base.TextureUnit.TEXTURE_1);
          this.shader.setVector2('inLightMapOffset', this.material.lightmapOffset);
          this.shader.setVector2('inLightMapScale', this.material.lightmapScale);
          this.shader.setTexture('inNormalMap', normalMap, bg.base.TextureUnit.TEXTURE_2);
          this.shader.setVector2('inNormalMapScale', this.material.normalMapScale);
          this.shader.setVector2('inNormalMapOffset', this.material.normalMapOffset);
          var shininessMask = this.material.shininessMask || bg.base.TextureCache.WhiteTexture(this.context);
          var lightEmissionMask = this.material.lightEmissionMask || bg.base.TextureCache.WhiteTexture(this.context);
          var reflectionMask = this.material.reflectionMask || bg.base.TextureCache.WhiteTexture(this.context);
          var roughnessMask = this.material.roughnessMask || bg.base.TextureCache.WhiteTexture(this.context);
          this.shader.setTexture('inShininessMask', shininessMask, bg.base.TextureUnit.TEXTURE_3);
          this.shader.setVector4('inShininessMaskChannel', this.material.shininessMaskChannelVector);
          this.shader.setValueInt('inShininessMaskInvert', this.material.shininessMaskInvert);
          this.shader.setTexture('inLightEmissionMask', lightEmissionMask, bg.base.TextureUnit.TEXTURE_4);
          this.shader.setVector4('inLightEmissionMaskChannel', this.material.lightEmissionMaskChannelVector);
          this.shader.setValueInt('inLightEmissionMaskInvert', this.material.lightEmissionMaskInvert);
          this.shader.setValueFloat('inReflection', this.material.reflectionAmount);
          this.shader.setTexture('inReflectionMask', reflectionMask, bg.base.TextureUnit.TEXTURE_5);
          this.shader.setVector4('inReflectionMaskChannel', this.material.reflectionMaskChannelVector);
          this.shader.setValueInt('inReflectionMaskInvert', this.material.reflectionMaskInvert);
          this.shader.setValueFloat('inRoughness', this.material.roughness);
          this.shader.setTexture('inRoughnessMask', roughnessMask, bg.base.TextureUnit.TEXTURE_6);
          this.shader.setVector4('inRoughnessMaskChannel', this.material.roughnessMaskChannelVector);
          this.shader.setValueInt('inRoughnessMaskInvert', this.material.roughnessMaskInvert);
          this.shader.setValueInt('inCastShadows', this.material.castShadows);
          this.shader.setValueInt('inUnlit', this.material.unlit);
        }
      }
    }, {}, $__super);
  }(bg.base.Effect);
  var PositionGBufferEffect = function($__super) {
    function PositionGBufferEffect(context) {
      $traceurRuntime.superConstructor(PositionGBufferEffect).call(this, context);
      var ubyte_shaders = [deferredShaders.gbuffer_float_vertex(), deferredShaders.gbuffer_float_fragment()];
      this._material = null;
      this.setupShaderSource(ubyte_shaders);
    }
    return ($traceurRuntime.createClass)(PositionGBufferEffect, {
      get material() {
        return this._material;
      },
      set material(m) {
        this._material = m;
      },
      setupVars: function() {
        if (this.material) {
          var matrixState = bg.base.MatrixState.Current();
          var viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
          this.shader.setMatrix4('inModelMatrix', matrixState.modelMatrixStack.matrixConst);
          this.shader.setMatrix4('inViewMatrix', viewMatrix);
          this.shader.setMatrix4('inProjectionMatrix', matrixState.projectionMatrixStack.matrixConst);
          var texture = this.material.texture || bg.base.TextureCache.WhiteTexture(this.context);
          this.shader.setTexture('inTexture', texture, bg.base.TextureUnit.TEXTURE_0);
          this.shader.setVector2('inTextureOffset', this.material.textureOffset);
          this.shader.setVector2('inTextureScale', this.material.textureScale);
        }
      }
    }, {}, $__super);
  }(bg.base.Effect);
  bg.render.PositionGBufferEffect = PositionGBufferEffect;
  bg.render.GBufferEffect = GBufferEffect;
})();

"use strict";
(function() {
  function updatePipeline(pipeline, drawVisitor, scene, camera) {
    bg.base.Pipeline.SetCurrent(pipeline);
    pipeline.viewport = camera.viewport;
    pipeline.clearBuffers(bg.base.ClearBuffers.COLOR | bg.base.ClearBuffers.DEPTH);
    scene.accept(drawVisitor);
  }
  var GBufferSet = function($__super) {
    function GBufferSet(context) {
      $traceurRuntime.superConstructor(GBufferSet).call(this, context);
      this._pipelines = {
        ubyte: new bg.base.Pipeline(context),
        float: new bg.base.Pipeline(context)
      };
      var ubyteRS = new bg.base.TextureSurface(context);
      ubyteRS.create([{
        type: bg.base.RenderSurfaceType.RGBA,
        format: bg.base.RenderSurfaceFormat.UNSIGNED_BYTE
      }, {
        type: bg.base.RenderSurfaceType.RGBA,
        format: bg.base.RenderSurfaceFormat.UNSIGNED_BYTE
      }, {
        type: bg.base.RenderSurfaceType.RGBA,
        format: bg.base.RenderSurfaceFormat.UNSIGNED_BYTE
      }, {
        type: bg.base.RenderSurfaceType.RGBA,
        format: bg.base.RenderSurfaceFormat.UNSIGNED_BYTE
      }, {
        type: bg.base.RenderSurfaceType.RGBA,
        format: bg.base.RenderSurfaceFormat.UNSIGNED_BYTE
      }, {
        type: bg.base.RenderSurfaceType.DEPTH,
        format: bg.base.RenderSurfaceFormat.RENDERBUFFER
      }]);
      this._pipelines.ubyte.effect = new bg.render.GBufferEffect(context);
      this._pipelines.ubyte.renderSurface = ubyteRS;
      var floatRS = new bg.base.TextureSurface(context);
      floatRS.create([{
        type: bg.base.RenderSurfaceType.RGBA,
        format: bg.base.RenderSurfaceFormat.FLOAT
      }, {
        type: bg.base.RenderSurfaceType.DEPTH,
        format: bg.base.RenderSurfaceFormat.RENDERBUFFER
      }]);
      this._pipelines.float.effect = new bg.render.PositionGBufferEffect(context);
      this._pipelines.float.renderSurface = floatRS;
      this._ubyteDrawVisitor = new bg.scene.DrawVisitor(this._pipelines.ubyte, this._matrixState);
      this._floatDrawVisitor = new bg.scene.DrawVisitor(this._pipelines.float, this._matrixState);
    }
    return ($traceurRuntime.createClass)(GBufferSet, {
      get diffuse() {
        return this._pipelines.ubyte.renderSurface.getTexture(0);
      },
      get specular() {
        return this._pipelines.ubyte.renderSurface.getTexture(1);
      },
      get normal() {
        return this._pipelines.ubyte.renderSurface.getTexture(2);
      },
      get material() {
        return this._pipelines.ubyte.renderSurface.getTexture(3);
      },
      get position() {
        return this._pipelines.float.renderSurface.getTexture(0);
      },
      get shadow() {
        return this._pipelines.ubyte.renderSurface.getTexture(4);
      },
      update: function(sceneRoot, camera) {
        updatePipeline(this._pipelines.ubyte, this._ubyteDrawVisitor, sceneRoot, camera);
        updatePipeline(this._pipelines.float, this._floatDrawVisitor, sceneRoot, camera);
      }
    }, {}, $__super);
  }(bg.app.ContextObject);
  bg.render.GBufferSet = GBufferSet;
})();

"use strict";
(function() {
  function lib() {
    return bg.base.ShaderLibrary.Get();
  }
  var LightingEffect = function($__super) {
    function LightingEffect(context) {
      $traceurRuntime.superConstructor(LightingEffect).call(this, context);
    }
    return ($traceurRuntime.createClass)(LightingEffect, {
      get fragmentShaderSource() {
        if (!this._fragmentShaderSource) {
          this._fragmentShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
          this._fragmentShaderSource.addParameter([{
            name: "inDiffuse",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inSpecular",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inNormal",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inMaterial",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inPosition",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inShadowMap",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inLightEmissionFactor",
            dataType: "float",
            role: "value"
          }, {
            name: "fsTexCoord",
            dataType: "vec2",
            role: "in"
          }]);
          this._fragmentShaderSource.addParameter(lib().inputs.lighting.all);
          this._fragmentShaderSource.addFunction(lib().functions.utils.all);
          this._fragmentShaderSource.addFunction(lib().functions.lighting.all);
          if (bg.Engine.Get().id == "webgl1") {
            this._fragmentShaderSource.setMainBody("\n\t\t\t\t\tvec4 diffuse = texture2D(inDiffuse,fsTexCoord);\n\t\t\t\t\tvec4 specular = vec4(texture2D(inSpecular,fsTexCoord).rgb,1.0);\n\t\t\t\t\tvec4 normalTex = texture2D(inNormal,fsTexCoord);\n\t\t\t\t\tvec3 normal = normalTex.xyz * 2.0 - 1.0;\n\t\t\t\t\tvec4 material = texture2D(inMaterial,fsTexCoord);\n\t\t\t\t\tvec4 position = texture2D(inPosition,fsTexCoord);\n\t\t\t\t\t\n\t\t\t\t\tvec4 shadowColor = texture2D(inShadowMap,fsTexCoord);\n\t\t\t\t\tfloat shininess = material.g * 255.0;\n\t\t\t\t\tfloat lightEmission = material.r;\n\t\t\t\t\tbool unlit = normalTex.a == 0.0;\n\t\t\t\t\tif (unlit) {\n\t\t\t\t\t\tgl_FragColor = vec4(diffuse.rgb * min(inLightEmissionFactor,1.0),1.0);\n\t\t\t\t\t}\n\t\t\t\t\telse {\n\t\t\t\t\t\tvec4 light = getLight(\n\t\t\t\t\t\t\tinLightType,\n\t\t\t\t\t\t\tinLightAmbient, inLightDiffuse, inLightSpecular,shininess,\n\t\t\t\t\t\t\tinLightPosition,inLightDirection,\n\t\t\t\t\t\t\tinLightAttenuation.x,inLightAttenuation.y,inLightAttenuation.z,\n\t\t\t\t\t\t\tinSpotCutoff,inSpotExponent,inLightCutoffDistance,\n\t\t\t\t\t\t\tposition.rgb,normal,\n\t\t\t\t\t\t\tdiffuse,specular,shadowColor\n\t\t\t\t\t\t);\n\t\t\t\t\t\tlight.rgb = light.rgb + (lightEmission * diffuse.rgb * inLightEmissionFactor);\n\t\t\t\t\t\tgl_FragColor = light;\n\t\t\t\t\t}\n\t\t\t\t\t");
          }
        }
        return this._fragmentShaderSource;
      },
      setupVars: function() {
        this.shader.setTexture("inDiffuse", this._surface.diffuse, bg.base.TextureUnit.TEXTURE_0);
        this.shader.setTexture("inSpecular", this._surface.specular, bg.base.TextureUnit.TEXTURE_1);
        this.shader.setTexture("inNormal", this._surface.normal, bg.base.TextureUnit.TEXTURE_2);
        this.shader.setTexture("inMaterial", this._surface.material, bg.base.TextureUnit.TEXTURE_3);
        this.shader.setTexture("inPosition", this._surface.position, bg.base.TextureUnit.TEXTURE_4);
        this.shader.setTexture("inShadowMap", this._shadowMap, bg.base.TextureUnit.TEXTURE_5);
        if (this.light) {
          var matrixState = bg.base.MatrixState.Current();
          var viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
          this.shader.setVector4('inLightAmbient', this._light.ambient);
          this.shader.setVector4('inLightDiffuse', this._light.diffuse);
          this.shader.setVector4('inLightSpecular', this._light.specular);
          this.shader.setValueInt('inLightType', this._light.type);
          this.shader.setVector3('inLightAttenuation', this._light.attenuationVector);
          this.shader.setValueFloat('inLightEmissionFactor', this.lightEmissionFactor);
          this.shader.setValueFloat('inLightCutoffDistance', this._light.cutoffDistance);
          var dir = viewMatrix.mult(this._lightTransform).rotation.multVector(this._light.direction).xyz;
          var pos = viewMatrix.position;
          this.shader.setVector3('inLightDirection', dir);
          this.shader.setVector3('inLightPosition', pos);
          this.shader.setValueFloat('inSpotCutoff', this._light.spotCutoff);
          this.shader.setValueFloat('inSpotExponent', this._light.spotExponent);
        }
      },
      get lightEmissionFactor() {
        return this._lightEmissionFactor;
      },
      set lightEmissionFactor(f) {
        this._lightEmissionFactor = f;
      },
      get light() {
        return this._light;
      },
      set light(l) {
        this._light = l;
      },
      get lightTransform() {
        return this._lightTransform;
      },
      set lightTransform(t) {
        this._lightTransform = t;
      },
      get shadowMap() {
        return this._shadowMap;
      },
      set shadowMap(sm) {
        this._shadowMap = sm;
      }
    }, {}, $__super);
  }(bg.base.TextureEffect);
  bg.render.LightingEffect = LightingEffect;
})();

"use strict";
(function() {
  function lib() {
    return bg.base.ShaderLibrary.Get();
  }
  var PostprocessEffect = function($__super) {
    function PostprocessEffect(context) {
      $traceurRuntime.superConstructor(PostprocessEffect).call(this, context);
    }
    return ($traceurRuntime.createClass)(PostprocessEffect, {
      get fragmentShaderSource() {
        if (!this._fragmentShaderSource) {
          this._fragmentShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
          this._fragmentShaderSource.addParameter([{
            name: "inTexture",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inFrameSize",
            dataType: "vec2",
            role: "value"
          }, {
            name: "inBorderAntiAlias",
            dataType: "int",
            role: "value"
          }, {
            name: "fsTexCoord",
            dataType: "vec2",
            role: "in"
          }]);
          if (bg.Engine.Get().id == "webgl1") {
            this._fragmentShaderSource.addFunction(lib().functions.utils.texOffset);
            this._fragmentShaderSource.addFunction(lib().functions.utils.luminance);
            this._fragmentShaderSource.addFunction(lib().functions.utils.borderDetection);
            this._fragmentShaderSource.addFunction(lib().functions.blur.textureDownsample);
            this._fragmentShaderSource.addFunction(lib().functions.blur.gaussianBlur);
            this._fragmentShaderSource.addFunction(lib().functions.blur.antiAlias);
            this._fragmentShaderSource.setMainBody("\n\t\t\t\t\t\tvec4 result = vec4(0.0,0.0,0.0,1.0);\n\t\t\t\t\t\tif (inBorderAntiAlias==1) {\n\t\t\t\t\t\t\tresult = antiAlias(inTexture,fsTexCoord,inFrameSize,0.1,3);\n\t\t\t\t\t\t}\n\t\t\t\t\t\telse {\n\t\t\t\t\t\t\tresult = texture2D(inTexture,fsTexCoord);\n\t\t\t\t\t\t}\n\t\t\t\t\t\tgl_FragColor = result;\n\t\t\t\t\t\t");
          }
        }
        return this._fragmentShaderSource;
      },
      setupVars: function() {
        this.shader.setTexture("inTexture", this._surface.texture, bg.base.TextureUnit.TEXTURE_0);
        this.shader.setVector2("inFrameSize", this._surface.texture.size);
        this.shader.setValueInt("inBorderAntiAlias", 0);
      },
      get settings() {
        if (!this._settings) {
          this._currentKernelSize = 0;
          this._settings = {refractionAmount: 0.01};
        }
        return this._settings;
      }
    }, {}, $__super);
  }(bg.base.TextureEffect);
  bg.render.PostprocessEffect = PostprocessEffect;
})();

"use strict";
(function() {
  function lib() {
    return bg.base.ShaderLibrary.Get();
  }
  var RendererMixEffect = function($__super) {
    function RendererMixEffect(context) {
      $traceurRuntime.superConstructor(RendererMixEffect).call(this, context);
    }
    return ($traceurRuntime.createClass)(RendererMixEffect, {
      get fragmentShaderSource() {
        if (!this._fragmentShaderSource) {
          this._fragmentShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
          this._fragmentShaderSource.addParameter([{
            name: "inOpaque",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inTransparent",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inTransparentNormal",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inOpaqueDepth",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inTransparentDepth",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inRefractionAmount",
            dataType: "float",
            role: "value"
          }, {
            name: "fsTexCoord",
            dataType: "vec2",
            role: "in"
          }]);
          if (bg.Engine.Get().id == "webgl1") {
            this._fragmentShaderSource.setMainBody("\n\t\t\t\t\t\tvec4 opaque = texture2D(inOpaque,fsTexCoord);\n\t\t\t\t\t\tvec4 transparent = texture2D(inTransparent,fsTexCoord);\n\t\t\t\t\t\tvec3 normal = texture2D(inTransparentNormal,fsTexCoord).rgb * 2.0 - 1.0;\n\t\t\t\t\t\tif (transparent.a>0.0) {\n\t\t\t\t\t\t\tfloat refractionFactor = inRefractionAmount / texture2D(inTransparentDepth,fsTexCoord).z;\n\t\t\t\t\t\t\tvec2 offset = fsTexCoord - normal.xy * refractionFactor;\n\t\t\t\t\t\t\tvec4 opaqueDepth = texture2D(inOpaqueDepth,offset);\n\t\t\t\t\t\t\tvec4 transparentDepth = texture2D(inTransparentDepth,offset);\n\t\t\t\t\t\t\t//if (opaqueDepth.w>transparentDepth.w) {\n\t\t\t\t\t\t\t\topaque = texture2D(inOpaque,offset);\n\t\t\t\t\t\t\t//}\n\t\t\t\t\t\t}\n\t\t\t\t\t\tvec3 color = opaque.rgb * (1.0 - transparent.a) + transparent.rgb * transparent.a;\n\t\t\t\t\t\tgl_FragColor = vec4(color, 1.0);\n\t\t\t\t\t\t");
          }
        }
        return this._fragmentShaderSource;
      },
      setupVars: function() {
        this.shader.setTexture("inOpaque", this._surface.opaque, bg.base.TextureUnit.TEXTURE_0);
        this.shader.setTexture("inTransparent", this._surface.transparent, bg.base.TextureUnit.TEXTURE_1);
        this.shader.setTexture("inTransparentNormal", this._surface.transparentNormal, bg.base.TextureUnit.TEXTURE_2);
        this.shader.setTexture("inOpaqueDepth", this._surface.opaqueDepth, bg.base.TextureUnit.TEXTURE_3);
        this.shader.setTexture("inTransparentDepth", this._surface.transparentDepth, bg.base.TextureUnit.TEXTURE_4);
        this.shader.setValueFloat("inRefractionAmount", this.settings.refractionAmount);
      },
      get settings() {
        if (!this._settings) {
          this._currentKernelSize = 0;
          this._settings = {refractionAmount: -0.05};
        }
        return this._settings;
      }
    }, {}, $__super);
  }(bg.base.TextureEffect);
  bg.render.RendererMixEffect = RendererMixEffect;
})();

"use strict";
(function() {
  function lib() {
    return bg.base.ShaderLibrary.Get();
  }
  var ShadowEffect = function($__super) {
    function ShadowEffect(context) {
      $traceurRuntime.superConstructor(ShadowEffect).call(this, context);
      var vertex = new bg.base.ShaderSource(bg.base.ShaderType.VERTEX);
      var fragment = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
      vertex.addParameter([lib().inputs.buffers.vertex, lib().inputs.buffers.tex0, null, lib().inputs.matrix.model, lib().inputs.matrix.view, lib().inputs.matrix.projection, {
        name: "inLightProjectionMatrix",
        dataType: "mat4",
        role: "value"
      }, {
        name: "inLightViewMatrix",
        dataType: "mat4",
        role: "value"
      }, null, {
        name: "fsTexCoord",
        dataType: "vec2",
        role: "out"
      }, {
        name: "fsVertexPosFromLight",
        dataType: "vec4",
        role: "out"
      }]);
      fragment.addParameter(lib().inputs.shadows.all);
      fragment.addFunction(lib().functions.utils.unpack);
      fragment.addFunction(lib().functions.lighting.getShadowColor);
      fragment.addParameter([lib().inputs.material.receiveShadows, lib().inputs.material.texture, lib().inputs.material.textureOffset, lib().inputs.material.textureScale, lib().inputs.material.alphaCutoff, null, {
        name: "fsTexCoord",
        dataType: "vec2",
        role: "in"
      }, {
        name: "fsVertexPosFromLight",
        dataType: "vec4",
        role: "in"
      }]);
      fragment.addFunction(lib().functions.materials.samplerColor);
      if (bg.Engine.Get().id == "webgl1") {
        vertex.setMainBody("\n\t\t\t\t\tmat4 ScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0,\n\t\t\t\t\t\t\t\t\t\t\t0.0, 0.5, 0.0, 0.0,\n\t\t\t\t\t\t\t\t\t\t\t0.0, 0.0, 0.5, 0.0,\n\t\t\t\t\t\t\t\t\t\t\t0.5, 0.5, 0.5, 1.0);\n\t\t\t\t\t\n\t\t\t\t\tfsVertexPosFromLight = ScaleMatrix * inLightProjectionMatrix * inLightViewMatrix * inModelMatrix * vec4(inVertex,1.0);\n\t\t\t\t\tfsTexCoord = inTex0;\n\t\t\t\t\t\n\t\t\t\t\tgl_Position = inProjectionMatrix * inViewMatrix * inModelMatrix * vec4(inVertex,1.0);");
        fragment.setMainBody("\n\t\t\t\t\tfloat alpha = samplerColor(inTexture,fsTexCoord,inTextureOffset,inTextureScale).a;\n\t\t\t\t\tif (alpha>inAlphaCutoff) {\n\t\t\t\t\t\tvec4 shadowColor = vec4(1.0, 1.0, 1.0, 1.0);\n\t\t\t\t\t\tif (inReceiveShadows) {\n\t\t\t\t\t\t\tshadowColor = getShadowColor(fsVertexPosFromLight,inShadowMap,inShadowMapSize,\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t inShadowType,inShadowStrength,inShadowBias,inShadowColor);\n\t\t\t\t\t\t}\n\t\t\t\t\t\tgl_FragColor = shadowColor;\n\t\t\t\t\t}\n\t\t\t\t\telse {\n\t\t\t\t\t\tdiscard;\n\t\t\t\t\t}");
      }
      this.setupShaderSource([vertex, fragment]);
    }
    return ($traceurRuntime.createClass)(ShadowEffect, {
      beginDraw: function() {
        if (this.light && this.shadowMap) {
          var matrixState = bg.base.MatrixState.Current();
          var viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
          var lightTransform = this.shadowMap.viewMatrix;
          this.shader.setMatrix4("inLightProjectionMatrix", this.shadowMap.projection);
          this.shader.setMatrix4("inLightViewMatrix", lightTransform);
          this.shader.setValueInt("inShadowType", this.shadowMap.shadowType);
          this.shader.setTexture("inShadowMap", this.shadowMap.texture, bg.base.TextureUnit.TEXTURE_1);
          this.shader.setVector2("inShadowMapSize", this.shadowMap.size);
          this.shader.setValueFloat("inShadowStrength", this.light.shadowStrength);
          this.shader.setVector4("inShadowColor", this.shadowMap.shadowColor);
          this.shader.setValueFloat("inShadowBias", this.light.shadowBias);
        }
      },
      setupVars: function() {
        if (this.material && this.light) {
          var matrixState = bg.base.MatrixState.Current();
          var viewMatrix = new bg.Matrix4(matrixState.viewMatrixStack.matrixConst);
          this.shader.setMatrix4("inModelMatrix", matrixState.modelMatrixStack.matrixConst);
          this.shader.setMatrix4("inViewMatrix", viewMatrix);
          this.shader.setMatrix4("inProjectionMatrix", matrixState.projectionMatrixStack.matrixConst);
          var texture = this.material.texture || bg.base.TextureCache.WhiteTexture(this.context);
          this.shader.setTexture("inTexture", texture, bg.base.TextureUnit.TEXTURE_0);
          this.shader.setVector2("inTextureOffset", this.material.textureOffset);
          this.shader.setVector2("inTextureScale", this.material.textureScale);
          this.shader.setValueFloat("inAlphaCutoff", this.material.alphaCutoff);
          this.shader.setValueInt("inReceiveShadows", this.material.receiveShadows);
        }
      },
      get material() {
        return this._material;
      },
      set material(m) {
        this._material = m;
      },
      get light() {
        return this._light;
      },
      set light(l) {
        this._light = l;
      },
      get shadowMap() {
        return this._shadowMap;
      },
      set shadowMap(sm) {
        this._shadowMap = sm;
      }
    }, {}, $__super);
  }(bg.base.Effect);
  bg.render.ShadowEffect = ShadowEffect;
})();

"use strict";
(function() {
  function lib() {
    return bg.base.ShaderLibrary.Get();
  }
  var MAX_KERN_OFFSETS = 64;
  var SSAOEffect = function($__super) {
    function SSAOEffect(context) {
      $traceurRuntime.superConstructor(SSAOEffect).call(this, context);
    }
    return ($traceurRuntime.createClass)(SSAOEffect, {
      get fragmentShaderSource() {
        if (!this._fragmentShaderSource) {
          this._fragmentShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
          this._fragmentShaderSource.addParameter([{
            name: "inViewportSize",
            dataType: "vec2",
            role: "value"
          }, {
            name: "inPositionMap",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inNormalMap",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inProjectionMatrix",
            dataType: "mat4",
            role: "value"
          }, {
            name: "inRandomMap",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inRandomMapSize",
            dataType: "vec2",
            role: "value"
          }, {
            name: "inSampleRadius",
            dataType: "float",
            role: "value"
          }, {
            name: "inKernelOffsets",
            dataType: "vec3",
            role: "value",
            vec: MAX_KERN_OFFSETS
          }, {
            name: "inKernelSize",
            dataType: "int",
            role: "value"
          }, {
            name: "inSSAOColor",
            dataType: "vec4",
            role: "value"
          }, {
            name: "inEnabled",
            dataType: "bool",
            role: "value"
          }, {
            name: "inMaxDistance",
            dataType: "float",
            role: "value"
          }, {
            name: "fsTexCoord",
            dataType: "vec2",
            role: "in"
          }]);
          if (bg.Engine.Get().id == "webgl1") {
            this._fragmentShaderSource.setMainBody(("\n\t\t\t\t\tif (!inEnabled) discard;\n\t\t\t\t\telse {\n\t\t\t\t\t\tvec4 normalTex = texture2D(inNormalMap,fsTexCoord);\n\t\t\t\t\t\tvec3 normal = normalTex.xyz * 2.0 - 1.0;\n\t\t\t\t\t\tvec4 vertexPos = texture2D(inPositionMap,fsTexCoord);\n\t\t\t\t\t\tif (distance(vertexPos.xyz,vec3(0))>inMaxDistance || vertexPos.w==1.0 || normalTex.a==0.0) {\n\t\t\t\t\t\t\tdiscard;\n\t\t\t\t\t\t}\n\t\t\t\t\t\telse {\n\t\t\t\t\t\t\tvec2 noiseScale = vec2(inViewportSize.x/inRandomMapSize.x,inViewportSize.y/inRandomMapSize.y);\n\t\t\t\t\t\t\tvec3 randomVector = texture2D(inRandomMap, fsTexCoord * noiseScale).xyz * 2.0 - 1.0;\n\t\t\t\t\t\t\tvec3 tangent = normalize(randomVector - normal * dot(randomVector, normal));\n\t\t\t\t\t\t\tvec3 bitangent = cross(normal,tangent);\n\t\t\t\t\t\t\tmat3 tbn = mat3(tangent, bitangent, normal);\n\n\t\t\t\t\t\t\tfloat occlusion = 0.0;\n\t\t\t\t\t\t\tfor (int i=0; i<" + MAX_KERN_OFFSETS + "; ++i) {\n\t\t\t\t\t\t\t\tif (inKernelSize==i) break;\n\t\t\t\t\t\t\t\tvec3 samplePos = tbn * inKernelOffsets[i];\n\t\t\t\t\t\t\t\tsamplePos = samplePos * inSampleRadius + vertexPos.xyz;\n\n\t\t\t\t\t\t\t\tvec4 offset = inProjectionMatrix * vec4(samplePos, 1.0);\t// -w, w\n\t\t\t\t\t\t\t\toffset.xyz /= offset.w;\t// -1, 1\n\t\t\t\t\t\t\t\toffset.xyz = offset.xyz * 0.5 + 0.5;\t// 0, 1\n\n\t\t\t\t\t\t\t\tvec4 sampleRealPos = texture2D(inPositionMap, offset.xy);\n\t\t\t\t\t\t\t\tif (samplePos.z<sampleRealPos.z) {\n\t\t\t\t\t\t\t\t\tfloat dist = distance(vertexPos.xyz, sampleRealPos.xyz);\n\t\t\t\t\t\t\t\t\tocclusion += dist<inSampleRadius ? 1.0:0.0;\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\tocclusion = 1.0 - (occlusion / float(inKernelSize));\n\t\t\t\t\t\t\tgl_FragColor = clamp(vec4(occlusion, occlusion, occlusion, 1.0) + inSSAOColor, 0.0, 1.0);\n\t\t\t\t\t\t\t//gl_FragColor = vec4(1.0, 0.0, 0.0 ,1.0);\n\t\t\t\t\t\t}\n\t\t\t\t\t}"));
          }
        }
        return this._fragmentShaderSource;
      },
      setupVars: function() {
        if (this.settings.kernelSize > MAX_KERN_OFFSETS) {
          this.settings.kernelSize = MAX_KERN_OFFSETS;
        }
        this.shader.setVector2("inViewportSize", new bg.Vector2(this.viewport.width, this.viewport.height));
        this.shader.setTexture("inPositionMap", this._surface.position, bg.base.TextureUnit.TEXTURE_0);
        this.shader.setTexture("inNormalMap", this._surface.normal, bg.base.TextureUnit.TEXTURE_1);
        this.shader.setMatrix4("inProjectionMatrix", this.projectionMatrix);
        this.shader.setTexture("inRandomMap", this.randomMap, bg.base.TextureUnit.TEXTURE_2);
        this.shader.setVector2("inRandomMapSize", this.randomMap.size);
        this.shader.setValueFloat("inSampleRadius", this.settings.sampleRadius);
        this.shader.setVector3Ptr("inKernelOffsets", this.kernelOffsets);
        this.shader.setValueInt("inKernelSize", this.settings.kernelSize);
        this.shader.setVector4("inSSAOColor", this.settings.color);
        this.shader.setValueInt("inEnabled", this.settings.enabled);
        this.shader.setValueFloat("inMaxDistance", this.settings.maxDistance);
      },
      get viewport() {
        return this._viewport;
      },
      set viewport(vp) {
        this._viewport = vp;
      },
      get projectionMatrix() {
        return this._projectionMatrix;
      },
      set projectionMatrix(p) {
        this._projectionMatrix = p;
      },
      get randomMap() {
        if (!this._randomMap) {
          this._randomMap = bg.base.TextureCache.RandomTexture(this.context);
        }
        return this._randomMap;
      },
      set randomMap(rm) {
        this._randomMap = rm;
      },
      get settings() {
        if (!this._settings) {
          this._currentKernelSize = 0;
          this._settings = {
            kernelSize: 32,
            sampleRadius: 0.3,
            color: bg.Color.Black(),
            blur: 4,
            maxDistance: 100.0,
            enabled: true
          };
        }
        return this._settings;
      },
      get kernelOffsets() {
        if (this._currentKernelSize != this.settings.kernelSize) {
          this._kernelOffsets = [];
          for (var i = 0; i < this.settings.kernelSize * 3; i += 3) {
            var kernel = new bg.Vector3(bg.Math.random() * 2.0 - 1.0, bg.Math.random() * 2.0 - 1.0, bg.Math.random());
            kernel.normalize();
            var scale = (i / 3) / this.settings.kernelSize;
            scale = bg.Math.lerp(0.1, 1.0, scale * scale);
            kernel.scale(scale);
            this._kernelOffsets.push(kernel.x);
            this._kernelOffsets.push(kernel.y);
            this._kernelOffsets.push(kernel.z);
          }
          this._currentKernelSize = this.settings.kernelSize;
        }
        return this._kernelOffsets;
      }
    }, {}, $__super);
  }(bg.base.TextureEffect);
  bg.render.SSAOEffect = SSAOEffect;
})();

"use strict";
(function() {
  function lib() {
    return bg.base.ShaderLibrary.Get();
  }
  bg.render.RaytracerQuality = {
    low: {
      maxSamples: 20,
      rayIncrement: 0.05
    },
    mid: {
      maxSamples: 50,
      rayIncrement: 0.025
    },
    high: {
      maxSamples: 100,
      rayIncrement: 0.0125
    },
    extreme: {
      maxSamples: 200,
      rayIncrement: 0.0062
    }
  };
  var SSRTEffect = function($__super) {
    function SSRTEffect(context) {
      $traceurRuntime.superConstructor(SSRTEffect).call(this, context);
      this._basic = false;
    }
    return ($traceurRuntime.createClass)(SSRTEffect, {
      get fragmentShaderSource() {
        if (!this._fragmentShaderSource) {
          this._fragmentShaderSource = new bg.base.ShaderSource(bg.base.ShaderType.FRAGMENT);
          var q = this.quality;
          this._fragmentShaderSource.addParameter([{
            name: "inPositionMap",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inNormalMap",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inLightingMap",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inMaterialMap",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inSamplePosMap",
            dataType: "sampler2D",
            role: "value"
          }, {
            name: "inProjectionMatrix",
            dataType: "mat4",
            role: "value"
          }, {
            name: "inCameraPos",
            dataType: "vec3",
            role: "value"
          }, {
            name: "inRayFailColor",
            dataType: "vec4",
            role: "value"
          }, {
            name: "inBasicMode",
            dataType: "bool",
            role: "value"
          }, {
            name: "inCubeMap",
            dataType: "samplerCube",
            role: "value"
          }, {
            name: "fsTexCoord",
            dataType: "vec2",
            role: "in"
          }]);
          if (bg.Engine.Get().id == "webgl1") {
            this._fragmentShaderSource.setMainBody(("\n\t\t\t\t\t\tvec3 normal = texture2D(inNormalMap,fsTexCoord).xyz * 2.0 - 1.0;\n\t\t\t\t\t\tvec4 vertexPos = texture2D(inPositionMap,fsTexCoord);\n\t\t\t\t\t\tvec3 cameraVector = vertexPos.xyz - inCameraPos;\n\t\t\t\t\t\tvec3 rayDirection = reflect(cameraVector,normal);\n\t\t\t\t\t\tvec4 lighting = texture2D(inLightingMap,fsTexCoord);\n\t\t\t\t\t\tvec4 material = texture2D(inMaterialMap,fsTexCoord);\n\t\t\t\t\t\tvec4 rayFailColor = inRayFailColor;\n\n\t\t\t\t\t\tvec3 lookup = reflect(cameraVector,normal);\n\t\t\t\t\t\trayFailColor = textureCube(inCubeMap, lookup);\n\t\t\t\t\t\t\n\t\t\t\t\t\tfloat increment = " + q.rayIncrement + ";\n\t\t\t\t\t\tvec4 result = rayFailColor;\n\t\t\t\t\t\tif (!inBasicMode && material.b>0.0) {\t// material[2] is reflectionAmount\n\t\t\t\t\t\t\tresult = rayFailColor;\n\t\t\t\t\t\t\tfor (float i=0.0; i<" + q.maxSamples + ".0; ++i) {\n\t\t\t\t\t\t\t\tif (i==" + q.maxSamples + ".0) {\n\t\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\t\tfloat radius = i * increment;\n\t\t\t\t\t\t\t\tincrement *= 1.01;\n\t\t\t\t\t\t\t\tvec3 ray = vertexPos.xyz + rayDirection * radius;\n\n\t\t\t\t\t\t\t\tvec4 offset = inProjectionMatrix * vec4(ray, 1.0);\t// -w, w\n\t\t\t\t\t\t\t\toffset.xyz /= offset.w;\t// -1, 1\n\t\t\t\t\t\t\t\toffset.xyz = offset.xyz * 0.5 + 0.5;\t// 0, 1\n\n\t\t\t\t\t\t\t\tvec4 rayActualPos = texture2D(inSamplePosMap, offset.xy);\n\t\t\t\t\t\t\t\tfloat hitDistance = rayActualPos.z - ray.z;\n\t\t\t\t\t\t\t\t//if (rayActualPos.w<0.6) {\n\t\t\t\t\t\t\t\t//\tresult = rayFailColor;\n\t\t\t\t\t\t\t\t//\tbreak;\n\t\t\t\t\t\t\t\t//}\n\t\t\t\t\t\t\t\tif (offset.x>1.0 || offset.y>1.0 || offset.x<0.0 || offset.y<0.0) {\n\t\t\t\t\t\t\t\t\tresult = rayFailColor;\n\t\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t\telse if (hitDistance>0.02 && hitDistance<0.15) {\n\t\t\t\t\t\t\t\t\tresult = texture2D(inLightingMap,offset.xy);\n\t\t\t\t\t\t\t\t\tbreak;\n\t\t\t\t\t\t\t\t}\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t}\n\t\t\t\t\t\tif (result.a==0.0) {\n\t\t\t\t\t\t\tgl_FragColor = rayFailColor;\n\t\t\t\t\t\t}\n\t\t\t\t\t\telse {\n\t\t\t\t\t\t\tgl_FragColor = result;\n\t\t\t\t\t\t}"));
          }
        }
        return this._fragmentShaderSource;
      },
      setupVars: function() {
        this.shader.setTexture("inPositionMap", this._surface.position, bg.base.TextureUnit.TEXTURE_0);
        this.shader.setTexture("inNormalMap", this._surface.normal, bg.base.TextureUnit.TEXTURE_1);
        this.shader.setTexture("inLightingMap", this._surface.reflectionColor, bg.base.TextureUnit.TEXTURE_2);
        this.shader.setTexture("inMaterialMap", this._surface.material, bg.base.TextureUnit.TEXTURE_3);
        this.shader.setTexture("inSamplePosMap", this._surface.reflectionDepth, bg.base.TextureUnit.TEXTURE_4);
        this.shader.setMatrix4("inProjectionMatrix", this._projectionMatrix);
        this.shader.setVector3("inCameraPos", this._cameraPos);
        this.shader.setVector4("inRayFailColor", this.rayFailColor);
        this.shader.setValueInt("inBasicMode", this.basic);
        this.shader.setTexture("inCubeMap", bg.scene.Cubemap.Current(this.context), bg.base.TextureUnit.TEXTURE_5);
      },
      get projectionMatrix() {
        return this._projectionMatrix;
      },
      set projectionMatrix(p) {
        this._projectionMatrix = p;
      },
      get cameraPosition() {
        return this._cameraPos;
      },
      set cameraPosition(c) {
        this._cameraPos = c;
      },
      get rayFailColor() {
        return this._rayFailColor || bg.Color.Black();
      },
      set rayFailColor(c) {
        this._rayFailColor = c;
      },
      get quality() {
        return this._quality || bg.render.RaytracerQuality.low;
      },
      set quality(q) {
        if (!this._quality || this._quality.maxSamples != q.maxSamples || this._quality.rayIncrement != q.rayIncrement) {
          this._quality = q;
          this._fragmentShaderSource = null;
          this.rebuildShaders();
        }
      },
      get basic() {
        return this._basic;
      },
      set basic(b) {
        this._basic = b;
      },
      get settings() {
        if (!this._settings) {}
        return this._settings;
      }
    }, {}, $__super);
  }(bg.base.TextureEffect);
  bg.render.SSRTEffect = SSRTEffect;
})();

"use strict";
bg.webgl1 = {};
(function() {
  var WEBGL_1_STRING = "webgl1";
  bg.webgl1.EngineId = WEBGL_1_STRING;
  var WebGL1Engine = function($__super) {
    function WebGL1Engine(context) {
      $traceurRuntime.superConstructor(WebGL1Engine).call(this, context);
      bg.webgl1.Extensions.Get(context);
      this._engineId = WEBGL_1_STRING;
      this._texture = new bg.webgl1.TextureImpl(context);
      this._pipeline = new bg.webgl1.PipelineImpl(context);
      this._polyList = new bg.webgl1.PolyListImpl(context);
      this._shader = new bg.webgl1.ShaderImpl(context);
      this._colorBuffer = new bg.webgl1.ColorRenderSurfaceImpl(context);
      this._textureBuffer = new bg.webgl1.TextureRenderSurfaceImpl(context);
      this._shaderSource = new bg.webgl1.ShaderSourceImpl();
    }
    return ($traceurRuntime.createClass)(WebGL1Engine, {}, {}, $__super);
  }(bg.Engine);
  bg.webgl1.Engine = WebGL1Engine;
})();

"use strict";
(function() {
  bg.webgl1.shaderLibrary = {
    inputs: {},
    functions: {}
  };
  var ShaderSourceImpl = function($__super) {
    function ShaderSourceImpl() {
      $traceurRuntime.superConstructor(ShaderSourceImpl).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(ShaderSourceImpl, {
      header: function(shaderType) {
        return "precision highp float;\nprecision highp int;";
      },
      parameter: function(shaderType, paramData) {
        if (!paramData)
          return "\n";
        var role = "";
        switch (paramData.role) {
          case "buffer":
            role = "attribute";
            break;
          case "value":
            role = "uniform";
            break;
          case "in":
          case "out":
            role = "varying";
            break;
        }
        var vec = "";
        if (paramData.vec) {
          vec = ("[" + paramData.vec + "]");
        }
        return (role + " " + paramData.dataType + " " + paramData.name + vec + ";");
      },
      func: function(shaderType, funcData) {
        if (!funcData)
          return "\n";
        var params = "";
        for (var name in funcData.params) {
          params += (funcData.params[name] + " " + name + ",");
        }
        var src = (funcData.returnType + " " + funcData.name + "(" + params + ") {").replace(',)', ')');
        var body = ("\n" + bg.base.ShaderSource.FormatSource(funcData.body)).replace(/\n/g, "\n\t");
        return src + body + "\n}";
      }
    }, {}, $__super);
  }(bg.base.ShaderSourceImpl);
  bg.webgl1.ShaderSourceImpl = ShaderSourceImpl;
})();

"use strict";
(function() {
  var s_singleton = null;
  var Extensions = function($__super) {
    function Extensions(gl) {
      $traceurRuntime.superConstructor(Extensions).call(this, gl);
    }
    return ($traceurRuntime.createClass)(Extensions, {
      getExtension: function(ext) {
        return this.context.getExtension(ext);
      },
      get textureFloat() {
        if (this._textureFloat === undefined) {
          this._textureFloat = this.getExtension("OES_texture_float");
        }
        return this._textureFloat;
      },
      get depthTexture() {
        if (this._depthTexture === undefined) {
          this._depthTexture = this.getExtension("WEBGL_depth_texture");
        }
        return this._depthTexture;
      },
      get drawBuffers() {
        if (this._drawBuffers === undefined) {
          this._drawBuffers = this.getExtension("WEBGL_draw_buffers");
        }
        return this._drawBuffers;
      }
    }, {Get: function(gl) {
        if (!s_singleton) {
          s_singleton = new Extensions(gl);
        }
        return s_singleton;
      }}, $__super);
  }(bg.app.ContextObject);
  bg.webgl1.Extensions = Extensions;
})();

"use strict";
(function() {
  var PipelineImpl = function($__super) {
    function PipelineImpl() {
      $traceurRuntime.superConstructor(PipelineImpl).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(PipelineImpl, {
      initFlags: function(context) {
        bg.base.ClearBuffers.COLOR = context.COLOR_BUFFER_BIT;
        bg.base.ClearBuffers.DEPTH = context.DEPTH_BUFFER_BIT;
      },
      setViewport: function(context, vp) {
        context.viewport(vp.x, vp.y, vp.width, vp.height);
      },
      clearBuffers: function(context, color, buffers) {
        context.clearColor(color.r, color.g, color.b, color.a);
        context.clear(buffers);
      },
      setDepthTestEnabled: function(context, e) {
        e ? context.enable(context.DEPTH_TEST) : context.disable(context.DEPTH_TEST);
      },
      setCullFace: function(context, e) {
        e ? context.enable(context.CULL_FACE) : context.disable(context.CULL_FACE);
      },
      setBlendEnabled: function(context, e) {
        e ? context.enable(context.BLEND) : context.disable(context.BLEND);
      },
      setBlendMode: function(gl, m) {
        switch (m) {
          case bg.base.BlendMode.NORMAL:
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            gl.blendEquation(gl.FUNC_ADD);
            break;
          case bg.base.BlendMode.MULTIPLY:
            gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
            gl.blendEquation(gl.FUNC_ADD);
            break;
          case bg.base.BlendMode.ADD:
            gl.blendFunc(gl.ONE, gl.ONE);
            gl.blendEquation(gl.FUNC_ADD);
            break;
          case bg.base.BlendMode.SUBTRACT:
            gl.blendFunc(gl.ONE, gl.ONE);
            gl.blendEquation(gl.FUNC_SUBTRACT);
            break;
          case bg.base.BlendMode.ALPHA_ADD:
            gl.blendFunc(gl.SRC_ALPHA, gl.SRC_ALPHA);
            gl.blendEquation(gl.FUNC_ADD);
            break;
          case bg.base.BlendMode.ALPHA_SUBTRACT:
            gl.blendFunc(gl.SRC_ALPHA, gl.SRC_ALPHA);
            gl.blendEquation(gl.FUNC_SUBTRACT);
            break;
        }
      }
    }, {}, $__super);
  }(bg.base.PipelineImpl);
  bg.webgl1.PipelineImpl = PipelineImpl;
})();

"use strict";
(function() {
  function createBuffer(context, array, itemSize, drawMode) {
    var result = null;
    if (array.length) {
      result = context.createBuffer();
      context.bindBuffer(context.ARRAY_BUFFER, result);
      context.bufferData(context.ARRAY_BUFFER, new Float32Array(array), drawMode);
      result.itemSize = itemSize;
      result.numItems = array.length / itemSize;
    }
    return result;
  }
  function deleteBuffer(context, buffer) {
    if (buffer) {
      context.deleteBuffer(buffer);
    }
    return null;
  }
  var s_uintElements = false;
  var PolyListImpl = function($__super) {
    function PolyListImpl() {
      $traceurRuntime.superConstructor(PolyListImpl).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(PolyListImpl, {
      initFlags: function(context) {
        bg.base.DrawMode.TRIANGLES = context.TRIANGLES;
        bg.base.DrawMode.TRIANGLE_FAN = context.TRIANGLE_FAN;
        bg.base.DrawMode.TRIANGLE_STRIP = context.TRIANGLE_STRIP;
        bg.base.DrawMode.LINES = context.LINES;
        bg.base.DrawMode.LINE_STRIP = context.LINE_STRIP;
        s_uintElements = context.getExtension("OES_element_index_uint");
      },
      create: function(context) {
        return {
          vertexBuffer: null,
          normalBuffer: null,
          tex0Buffer: null,
          tex1Buffer: null,
          tex2Buffer: null,
          colorBuffer: null,
          tangentBuffer: null,
          indexBuffer: null
        };
      },
      build: function(context, plist, vert, norm, t0, t1, t2, col, tan, index) {
        plist.vertexBuffer = createBuffer(context, vert, 3, context.STATIC_DRAW);
        plist.normalBuffer = createBuffer(context, norm, 3, context.STATIC_DRAW);
        plist.tex0Buffer = createBuffer(context, t0, 2, context.STATIC_DRAW);
        plist.tex1Buffer = createBuffer(context, t1, 2, context.STATIC_DRAW);
        plist.tex2Buffer = createBuffer(context, t2, 2, context.STATIC_DRAW);
        plist.colorBuffer = createBuffer(context, col, 4, context.STATIC_DRAW);
        plist.tangentBuffer = createBuffer(context, tan, 3, context.STATIC_DRAW);
        if (index.length > 0 && s_uintElements) {
          plist.indexBuffer = context.createBuffer();
          context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, plist.indexBuffer);
          context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint32Array(index), context.STATIC_DRAW);
          plist.indexBuffer.itemSize = 3;
          plist.indexBuffer.numItems = index.length;
        } else {
          plist.indexBuffer = context.createBuffer();
          context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, plist.indexBuffer);
          context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), context.STATIC_DRAW);
          plist.indexBuffer.itemSize = 3;
          plist.indexBuffer.numItems = index.length;
        }
        return plist.vertexBuffer && plist.indexBuffer;
      },
      draw: function(context, plist, drawMode, numberOfIndex) {
        context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, plist.indexBuffer);
        if (s_uintElements) {
          context.drawElements(drawMode, numberOfIndex, context.UNSIGNED_INT, 0);
        } else {
          context.drawElements(drawMode, numberOfIndex, context.UNSIGNED_SHORT, 0);
        }
      },
      destroy: function(context, plist) {
        context.bindBuffer(context.ARRAY_BUFFER, null);
        context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, null);
        plist.vertexBuffer = deleteBuffer(context, plist.vertexBuffer);
        plist.normalBuffer = deleteBuffer(context, plist.normalBuffer);
        plist.tex0Buffer = deleteBuffer(context, plist.tex0Buffer);
        plist.tex1Buffer = deleteBuffer(context, plist.tex1Buffer);
        plist.tex2Buffer = deleteBuffer(context, plist.tex2Buffer);
        plist.colorBuffer = deleteBuffer(context, plist.colorBuffer);
        plist.tangentBuffer = deleteBuffer(context, plist.tangentBuffer);
        plist.indexBuffer = deleteBuffer(context, plist.indexBuffer);
      },
      update: function(context, plist, bufferType, newData) {
        if (bufferType == bg.base.BufferType.INDEX) {
          if (s_uintElements) {
            context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, plist.indexBuffer);
            context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint32Array(index), context.STATIC_DRAW);
          } else {
            context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, plist.indexBuffer);
            context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), context.STATIC_DRAW);
          }
          context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, null);
        } else {
          switch (bufferType) {
            case bg.base.BufferType.VERTEX:
              context.bindBuffer(context.ARRAY_BUFFER, plist.vertexBuffer);
              break;
            case bg.base.BufferType.NORMAL:
              context.bindBuffer(context.ARRAY_BUFFER, plist.normalBuffer);
              break;
            case bg.base.BufferType.TEX_COORD_0:
              context.bindBuffer(context.ARRAY_BUFFER, plist.tex0Buffer);
              break;
            case bg.base.BufferType.TEX_COORD_1:
              context.bindBuffer(context.ARRAY_BUFFER, plist.tex1Buffer);
              break;
            case bg.base.BufferType.TEX_COORD_2:
              context.bindBuffer(context.ARRAY_BUFFER, plist.tex2Buffer);
              break;
            case bg.base.BufferType.COLOR:
              context.bindBuffer(context.ARRAY_BUFFER, plist.colorBuffer);
              break;
            case bg.base.BufferType.TANGENT:
              context.bindBuffer(context.ARRAY_BUFFER, plist.tangentBuffer);
              break;
          }
          context.bufferData(context.ARRAY_BUFFER, new Float32Array(newData), context.STATIC_DRAW);
          context.bindBuffer(context.ARRAY_BUFFER, null);
        }
      }
    }, {}, $__super);
  }(bg.base.PolyListImpl);
  bg.webgl1.PolyListImpl = PolyListImpl;
})();

"use strict";
(function() {
  var ext = null;
  function getMaxColorAttachments() {
    if (ext.drawBuffers) {
      return ext.drawBuffers.MAX_COLOR_ATTACHMENTS || ext.drawBuffers.MAX_COLOR_ATTACHMENTS_WEBGL;
    }
    return 1;
  }
  function checkValid(attachment) {
    switch (true) {
      case attachment.type == bg.base.RenderSurfaceType.RGBA && attachment.format == bg.base.RenderSurfaceFormat.UNSIGNED_BYTE:
        return true;
      case attachment.type == bg.base.RenderSurfaceType.RGBA && attachment.format == bg.base.RenderSurfaceFormat.FLOAT:
        return true;
      case attachment.type == bg.base.RenderSurfaceType.DEPTH && attachment.format == bg.base.RenderSurfaceFormat.RENDERBUFFER:
        return true;
      case attachment.type == bg.base.RenderSurfaceType.DEPTH && attachment.format == bg.base.RenderSurfaceFormat.UNSIGNED_SHORT:
        return true;
      default:
        return false;
    }
  }
  function getTypeString(type) {
    switch (type) {
      case bg.base.RenderSurfaceType.RGBA:
        return "RGBA";
      case bg.base.RenderSurfaceType.DEPTH:
        return "DEPTH";
      default:
        return "unknown";
    }
  }
  function getFormatString(format) {
    switch (format) {
      case bg.base.RenderSurfaceFormat.UNSIGNED_BYTE:
        return "UNSIGNED_BYTE";
      case bg.base.RenderSurfaceFormat.FLOAT:
        return "FLOAT";
      case bg.base.RenderSurfaceFormat.RENDERBUFFER:
        return "RENDERBUFFER";
      case bg.base.RenderSurfaceFormat.UNSIGNED_SHORT:
        return "UNSIGNED_SHORT";
      default:
        return "unknown";
    }
  }
  function checkCompatibility(attachments) {
    var colorAttachments = 0;
    var maxColorAttachments = getMaxColorAttachments();
    var error = null;
    attachments.every(function(att, index) {
      if (!checkValid(att)) {
        error = ("Error in attachment " + index + ": Invalid combination of type and format (" + getTypeString(att.type) + " is incompatible with " + getFormatString(att.format) + ").");
        return false;
      }
      if (att.type == bg.base.RenderSurfaceType.DEPTH && index != attachments.length - 1) {
        error = ("Error in attachment " + index + ": Depth attachment must be specified as the last attachment. Specified at index " + index + " of " + (attachments.length - 1));
        return false;
      }
      if (att.type == bg.base.RenderSurfaceType.RGBA) {
        ++colorAttachments;
      }
      if (att.format == bg.base.RenderSurfaceFormat.FLOAT && !ext.textureFloat) {
        error = ("Error in attachment " + index + ": Floating point render surface requested, but the required extension is not present: OES_texture_float.");
        return false;
      }
      if (att.type == bg.base.RenderSurfaceType.DEPTH && att.format != bg.base.RenderSurfaceFormat.RENDERBUFFER && !ext.depthTexture) {
        error = ("Error in attachment " + index + ": Depth texture attachment requested, but the requiered extension is not present: WEBGL_depth_texture.");
        return false;
      }
      if (colorAttachments > maxColorAttachments) {
        error = ("Error in attachment " + index + ": Maximum number of " + maxColorAttachments + " color attachment exceeded.");
        return false;
      }
      return true;
    });
    return error;
  }
  function addAttachment(gl, size, attachment, index) {
    if (attachment.format == bg.base.RenderSurfaceFormat.RENDERBUFFER) {
      var renderbuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size.width, size.height);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
      return {_renderbuffer: renderbuffer};
    } else {
      var texture = new bg.base.Texture(gl);
      var format = attachment.format;
      var type = attachment.type;
      texture.create();
      texture.bind();
      texture.minFilter = bg.base.TextureFilter.LINEAR;
      texture.magFilter = bg.base.TextureFilter.LINEAR;
      texture.wrapX = bg.base.TextureWrap.CLAMP;
      texture.wrapY = bg.base.TextureWrap.CLAMP;
      texture.setImageRaw(size.width, size.height, null, type, format);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + index, gl.TEXTURE_2D, texture._texture, 0);
      texture.unbind();
      return texture;
    }
  }
  function resizeAttachment(gl, size, att, index) {
    if (att.texture) {
      att.texture.bind();
      att.texture.setImageRaw(size.width, size.height, null, att.type, att.format);
      att.texture.unbind();
    }
    if (att.renderbuffer) {
      var rb = att.renderbuffer._renderbuffer;
      gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size.width, size.height);
      gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }
  }
  var WebGLRenderSurfaceImpl = function($__super) {
    function WebGLRenderSurfaceImpl() {
      $traceurRuntime.superConstructor(WebGLRenderSurfaceImpl).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(WebGLRenderSurfaceImpl, {
      initFlags: function(gl) {
        bg.base.RenderSurfaceType.RGBA = gl.RGBA;
        bg.base.RenderSurfaceType.DEPTH = gl.DEPTH_COMPONENT;
        bg.base.RenderSurfaceFormat.UNSIGNED_BYTE = gl.UNSIGNED_BYTE;
        bg.base.RenderSurfaceFormat.UNSIGNED_SHORT = gl.UNSIGNED_SHORT;
        bg.base.RenderSurfaceFormat.FLOAT = gl.FLOAT;
        bg.base.RenderSurfaceFormat.RENDERBUFFER = gl.RENDERBUFFER;
        ext = bg.webgl1.Extensions.Get();
      },
      supportType: function(type) {
        switch (type) {
          case bg.base.RenderSurfaceType.RGBA:
            return true;
          case bg.base.RenderSurfaceType.DEPTH:
            return ext.depthTexture != null;
          default:
            return false;
        }
      },
      supportFormat: function(format) {
        switch (format) {
          case bg.base.RenderSurfaceFormat.UNSIGNED_BYTE:
          case bg.base.RenderSurfaceFormat.UNSIGNED_SHORT:
            return true;
          case bg.base.RenderSurfaceFormat.FLOAT:
            return ext.textureFloat != null;
          default:
            return false;
        }
      },
      get maxColorAttachments() {
        return getMaxColorAttachments();
      }
    }, {}, $__super);
  }(bg.base.RenderSurfaceBufferImpl);
  var ColorRenderSurfaceImpl = function($__super) {
    function ColorRenderSurfaceImpl() {
      $traceurRuntime.superConstructor(ColorRenderSurfaceImpl).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(ColorRenderSurfaceImpl, {
      create: function(gl) {
        return {};
      },
      setActive: function(gl, renderSurface, attachments) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      },
      resize: function(gl, renderSurface, size) {},
      destroy: function(gl, renderSurface) {},
      readBuffer: function(gl, renderSurface, rectangle, viewportSize) {
        var pixels = new Uint8Array(rectangle.width * rectangle.height * 4);
        gl.readPixels(rectangle.x, rectangle.y, rectangle.width, rectangle.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        return pixels;
      }
    }, {}, $__super);
  }(WebGLRenderSurfaceImpl);
  bg.webgl1.ColorRenderSurfaceImpl = ColorRenderSurfaceImpl;
  var TextureRenderSurfaceImpl = function($__super) {
    function TextureRenderSurfaceImpl() {
      $traceurRuntime.superConstructor(TextureRenderSurfaceImpl).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(TextureRenderSurfaceImpl, {
      initFlags: function(gl) {},
      create: function(gl, attachments) {
        var error = checkCompatibility(attachments);
        if (error) {
          throw new Error(error);
        }
        var size = new bg.Vector2(256);
        var surfaceData = {
          fbo: gl.createFramebuffer(),
          size: size,
          attachments: []
        };
        gl.bindFramebuffer(gl.FRAMEBUFFER, surfaceData.fbo);
        var colorAttachments = [];
        attachments.forEach(function(att, i) {
          var result = addAttachment(gl, size, att, i);
          if (result instanceof bg.base.Texture) {
            colorAttachments.push(ext.drawBuffers ? ext.drawBuffers.COLOR_ATTACHMENT0_WEBGL + i : gl.COLOR_ATTACHMENT0);
          }
          surfaceData.attachments.push({
            texture: result instanceof bg.base.Texture ? result : null,
            renderbuffer: result instanceof bg.base.Texture ? null : result,
            format: att.format,
            type: att.type
          });
        });
        if (colorAttachments.length > 1) {
          ext.drawBuffers.drawBuffersWEBGL(colorAttachments);
        }
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return surfaceData;
      },
      setActive: function(gl, renderSurface) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, renderSurface.fbo);
      },
      readBuffer: function(gl, renderSurface, rectangle, viewportSize) {
        var pixels = new Uint8Array(rectangle.width * rectangle.height * 4);
        gl.readPixels(rectangle.x, viewportSize.height - rectangle.y, rectangle.width, rectangle.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
        return pixels;
      },
      resize: function(gl, renderSurface, size) {
        renderSurface.size.width = size.width;
        renderSurface.size.height = size.height;
        renderSurface.attachments.forEach(function(att, index) {
          resizeAttachment(gl, size, att, index);
        });
      },
      destroy: function(gl, renderSurface) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        var attachments = renderSurface && renderSurface.attachments;
        if (renderSurface.fbo) {
          gl.deleteFramebuffer(renderSurface.fbo);
        }
        if (attachments) {
          attachments.forEach(function(attachment) {
            if (attachment.texture) {
              attachment.texture.destroy();
            } else if (attachment.renderbuffer) {
              gl.deleteRenderbuffer(attachment.renderbuffer._renderbuffer);
            }
          });
        }
        renderSurface.fbo = null;
        renderSurface.size = null;
        renderSurface.attachments = null;
      }
    }, {}, $__super);
  }(WebGLRenderSurfaceImpl);
  bg.webgl1.TextureRenderSurfaceImpl = TextureRenderSurfaceImpl;
})();

"use strict";
(function() {
  var MAX_BLUR_ITERATIONS = 40;
  var BLUR_DOWNSAMPLE = 30;
  var textureCubeDownsampleParams = {
    textureInput: 'samplerCube',
    texCoord: 'vec3',
    size: 'vec2',
    reduction: 'vec2'
  };
  var textureCubeDownsampleBody = "\n\t\tfloat dx = reduction.x / size.x;\n\t\tfloat dy = reduction.y / size.y;\n\t\tvec2 coord = vec2(dx * texCoord.x / dx, dy * texCoord.y / dy);\n\t\treturn textureCube(textureInput,coord);\n\t";
  var textureDownsampleParams = {
    textureInput: 'sampler2D',
    texCoord: 'vec2',
    size: 'vec2',
    reduction: 'vec2'
  };
  var textureDownsampleBody = "\n\t\tfloat dx = reduction.x / size.x;\n\t\tfloat dy = reduction.y / size.y;\n\t\tvec2 coord = vec2(dx * texCoord.x / dx, dy * texCoord.y / dy);\n\t\treturn texture2D(textureInput,coord);\n\t";
  var blurParams = {
    textureInput: 'sampler2D',
    texCoord: 'vec2',
    size: 'int',
    samplerSize: 'vec2'
  };
  var blurBody = ("\n\t\tint downsample = " + BLUR_DOWNSAMPLE + ";\n\t\tvec2 texelSize = 1.0 / samplerSize;\n\t\tvec3 result = vec3(0.0);\n\t\tsize = int(max(float(size / downsample),1.0));\n\t\tvec2 hlim = vec2(float(-size) * 0.5 + 0.5);\n\t\tvec2 sign = vec2(1.0);\n\t\tfloat blurFactor = 10.0 - 0.2 * float(size) * log(float(size));\n\t\tfor (int x=0; x<" + MAX_BLUR_ITERATIONS + "; ++x) {\n\t\t\tif (x==size) break;\n\t\t\tfor (int y=0; y<" + MAX_BLUR_ITERATIONS + "; ++y) {\n\t\t\t\tif (y==size) break;\n\t\t\t\tvec2 offset = (hlim + vec2(float(x), float(y))) * texelSize * float(downsample) / blurFactor;\n\t\t\t\tresult += textureDownsample(textureInput, texCoord + offset,samplerSize,vec2(downsample)).rgb;\n\t\t\t}\n\t\t}\n\t\treturn vec4(result / float(size * size), 1.0);\n\t\t");
  var glowParams = {
    textureInput: 'sampler2D',
    texCoord: 'vec2',
    size: 'int',
    samplerSize: 'vec2'
  };
  var glowBody = ("\n\t\tint downsample = " + BLUR_DOWNSAMPLE + ";\n\t\tvec2 texelSize = 1.0 / samplerSize;\n\t\tvec3 result = vec3(0.0);\n\t\tsize = int(max(float(size / downsample),1.0));\n\t\tvec2 hlim = vec2(float(-size) * 0.5 + 0.5);\n\t\tvec2 sign = vec2(1.0);\n\t\tfor (int x=0; x<" + MAX_BLUR_ITERATIONS + "; ++x) {\n\t\t\tif (x==size) break;\n\t\t\tfor (int y=0; y<" + MAX_BLUR_ITERATIONS + "; ++y) {\n\t\t\t\tif (y==size) break;\n\t\t\t\tvec2 offset = (hlim + vec2(float(x), float(y))) * texelSize;\n\t\t\t\tresult += textureDownsample(textureInput, texCoord + offset,samplerSize,vec2(downsample)).rgb;\n\t\t\t}\n\t\t}\n\t\treturn vec4(result / float(size * size), 1.0);\n\t");
  var blurCubeParams = {
    textureInput: 'samplerCube',
    texCoord: 'vec3',
    size: 'int',
    samplerSize: 'vec2',
    dist: 'float'
  };
  var blurCubeBody = "\n\t\tint downsample = int(max(1.0,dist));\n\t\tvec2 texelSize = 1.0 / samplerSize;\n\t\tvec3 result = vec3(0.0);\n\t\tsize = int(max(float(size / downsample),1.0));\n\t\tvec2 hlim = vec2(float(-size) * 0.5 + 0.5);\n\t\tvec2 sign = vec2(1.0);\n\t\tfor (int x=0; x<40; ++x) {\n\t\t\tif (x==size) break;\n\t\t\tfor (int y=0; y<40; ++y) {\n\t\t\t\tif (y==size) break;\n\t\t\t\tvec3 offset = vec3((hlim + vec2(float(x*downsample), float(y*downsample))) * texelSize,0.0);\n\t\t\t\tresult += textureCube(textureInput, texCoord + offset,2.0).rgb;\n\t\t\t}\n\t\t}\n\t\treturn vec4(result / float(size * size), 1.0);\n\t\t";
  bg.webgl1.shaderLibrary.functions.blur = {
    textureDownsample: {
      returnType: "vec4",
      name: 'textureDownsample',
      params: textureDownsampleParams,
      body: textureDownsampleBody
    },
    gaussianBlur: {
      returnType: "vec4",
      name: "gaussianBlur",
      params: blurParams,
      body: blurBody
    },
    blur: {
      returnType: "vec4",
      name: "blur",
      params: blurParams,
      body: blurBody
    },
    glowBlur: {
      returnType: "vec4",
      name: "glowBlur",
      params: glowParams,
      body: glowBody
    },
    blurCube: {
      returnType: "vec4",
      name: "blurCube",
      params: blurCubeParams,
      body: blurCubeBody
    },
    antiAlias: {
      returnType: 'vec4',
      name: 'antiAlias',
      params: {
        sampler: 'sampler2D',
        texCoord: 'vec2',
        frameSize: 'vec2',
        tresshold: 'float',
        iterations: 'int'
      },
      body: "\n\t\t\t\treturn (borderDetection(sampler,texCoord,frameSize)>tresshold) ?\n\t\t\t\t\tgaussianBlur(sampler,texCoord,iterations,frameSize) :\n\t\t\t\t\ttexture2D(sampler,texCoord);\n\t\t\t\t"
    }
  };
})();

"use strict";
(function() {
  bg.webgl1.shaderLibrary.functions.colorCorrection = {
    rgb2hsv: {
      returnType: "vec3",
      name: "rgb2hsv",
      params: {c: "vec3"},
      body: "\n\t\t\t\tvec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n\t\t\t\tvec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n\t\t\t\tvec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n\n\t\t\t\tfloat d = q.x - min(q.w, q.y);\n\t\t\t\tfloat e = 1.0e-10;\n\t\t\t\treturn vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);"
    },
    hsv2rgb: {
      returnType: "vec3",
      name: "hsv2rgb",
      params: {c: "vec3"},
      body: "\n\t\t\t\tvec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n\t\t\t\tvec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n\t\t\t\treturn c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);"
    },
    applyBrightness: {
      returnType: "vec4",
      name: "applyBrightness",
      params: {
        color: "vec4",
        brightness: "float"
      },
      body: "\n\t\t\t\t\treturn clamp(vec4(color.rgb + brightness - 0.5,1.0),0.0,1.0);\n\t\t\t\t"
    },
    applyContrast: {
      returnType: "vec4",
      name: "applyContrast",
      params: {
        color: "vec4",
        contrast: "float"
      },
      body: "\n\t\t\t\treturn clamp(vec4((color.rgb * max(contrast + 0.5,0.0)),1.0),0.0,1.0);"
    },
    applySaturation: {
      returnType: "vec4",
      name: "applySaturation",
      params: {
        color: "vec4",
        hue: "float",
        saturation: "float",
        lightness: "float"
      },
      body: "\n\t\t\t\tvec3 fragRGB = clamp(color.rgb + vec3(0.001),0.0,1.0);\n\t\t\t\tvec3 fragHSV = rgb2hsv(fragRGB);\n\t\t\t\tlightness -= 0.01;\n\t\t\t\tfloat h = hue;\n\t\t\t\tfragHSV.x *= h;\n\t\t\t\tfragHSV.yz *= vec2(saturation,lightness);\n\t\t\t\tfragHSV.x = mod(fragHSV.x, 1.0);\n\t\t\t\tfragHSV.y = mod(fragHSV.y, 1.0);\n\t\t\t\tfragHSV.z = mod(fragHSV.z, 1.0);\n\t\t\t\tfragRGB = hsv2rgb(fragHSV);\n\t\t\t\treturn clamp(vec4(hsv2rgb(fragHSV), color.w),0.0,1.0);"
    },
    colorCorrection: {
      returnType: "vec4",
      name: "colorCorrection",
      params: {
        fragColor: "vec4",
        hue: "float",
        saturation: "float",
        lightness: "float",
        brightness: "float",
        contrast: "float"
      },
      body: "\n\t\t\t\treturn applyContrast(applyBrightness(applySaturation(fragColor,hue,saturation,lightness),brightness),contrast);"
    }
  };
})();

"use strict";
(function() {
  bg.webgl1.shaderLibrary.inputs = {
    buffers: {
      vertex: {
        name: "inVertex",
        dataType: "vec3",
        role: "buffer",
        target: "vertex"
      },
      normal: {
        name: "inNormal",
        dataType: "vec3",
        role: "buffer",
        target: "normal"
      },
      tangent: {
        name: "inTangent",
        dataType: "vec3",
        role: "buffer",
        target: "tangent"
      },
      tex0: {
        name: "inTex0",
        dataType: "vec2",
        role: "buffer",
        target: "tex0"
      },
      tex1: {
        name: "inTex1",
        dataType: "vec2",
        role: "buffer",
        target: "tex1"
      },
      tex2: {
        name: "inTex2",
        dataType: "vec2",
        role: "buffer",
        target: "tex2"
      },
      color: {
        name: "inColor",
        dataType: "vec4",
        role: "buffer",
        target: "color"
      }
    },
    matrix: {
      model: {
        name: "inModelMatrix",
        dataType: "mat4",
        role: "value"
      },
      view: {
        name: "inViewMatrix",
        dataType: "mat4",
        role: "value"
      },
      projection: {
        name: "inProjectionMatrix",
        dataType: "mat4",
        role: "value"
      },
      normal: {
        name: "inNormalMatrix",
        dataType: "mat4",
        role: "value"
      },
      viewInv: {
        name: "inViewMatrixInv",
        dataType: "mat4",
        role: "value"
      }
    },
    material: {
      diffuse: {
        name: "inDiffuseColor",
        dataType: "vec4",
        role: "value"
      },
      specular: {
        name: "inSpecularColor",
        dataType: "vec4",
        role: "value"
      },
      shininess: {
        name: "inShininess",
        dataType: "float",
        role: "value"
      },
      shininessMask: {
        name: "inShininessMask",
        dataType: "sampler2D",
        role: "value"
      },
      shininessMaskChannel: {
        name: "inShininessMaskChannel",
        dataType: "vec4",
        role: "value"
      },
      shininessMaskInvert: {
        name: "inShininessMaskInvert",
        dataType: "bool",
        role: "value"
      },
      lightEmission: {
        name: "inLightEmission",
        dataType: "float",
        role: "value"
      },
      lightEmissionMask: {
        name: "inLightEmissionMask",
        dataType: "sampler2D",
        role: "value"
      },
      lightEmissionMaskChannel: {
        name: "inLightEmissionMaskChannel",
        dataType: "vec4",
        role: "value"
      },
      lightEmissionMaskInvert: {
        name: "inLightEmissionMaskInvert",
        dataType: "bool",
        role: "value"
      },
      texture: {
        name: "inTexture",
        dataType: "sampler2D",
        role: "value"
      },
      textureOffset: {
        name: "inTextureOffset",
        dataType: "vec2",
        role: "value"
      },
      textureScale: {
        name: "inTextureScale",
        dataType: "vec2",
        role: "value"
      },
      alphaCutoff: {
        name: "inAlphaCutoff",
        dataType: "float",
        role: "value"
      },
      lightMap: {
        name: "inLightMap",
        dataType: "sampler2D",
        role: "value"
      },
      lightMapOffset: {
        name: "inLightMapOffset",
        dataType: "vec2",
        role: "value"
      },
      lightMapScale: {
        name: "inLightMapScale",
        dataType: "vec2",
        role: "value"
      },
      normalMap: {
        name: "inNormalMap",
        dataType: "sampler2D",
        role: "value"
      },
      normalMapOffset: {
        name: "inNormalMapOffset",
        dataType: "vec2",
        role: "value"
      },
      normalMapScale: {
        name: "inNormalMapScale",
        dataType: "vec2",
        role: "value"
      },
      reflection: {
        name: "inReflection",
        dataType: "float",
        role: "value"
      },
      reflectionMask: {
        name: "inReflectionMask",
        dataType: "sampler2D",
        role: "value"
      },
      reflectionMaskChannel: {
        name: "inReflectionMaskChannel",
        dataType: "vec4",
        role: "value"
      },
      reflectionMaskInvert: {
        name: "inReflectionMaskInvert",
        dataType: "bool",
        role: "value"
      },
      castShadows: {
        name: "inCastShadows",
        dataType: "bool",
        role: "value"
      },
      receiveShadows: {
        name: "inReceiveShadows",
        dataType: "bool",
        role: "value"
      },
      roughness: {
        name: "inRoughness",
        dataType: "float",
        role: "value"
      },
      roughnessMask: {
        name: "inRoughnessMask",
        dataType: "sampler2D",
        role: "value"
      },
      roughnessMaskChannel: {
        name: "inRoughnessMaskChannel",
        dataType: "vec4",
        role: "value"
      },
      roughnessMaskInvert: {
        name: "inRoughnessMaskInvert",
        dataType: "bool",
        role: "value"
      },
      unlit: {
        name: "inUnlit",
        dataType: "bool",
        role: "value"
      }
    },
    lighting: {
      type: {
        name: "inLightType",
        dataType: "int",
        role: "value"
      },
      position: {
        name: "inLightPosition",
        dataType: "vec3",
        role: "value"
      },
      direction: {
        name: "inLightDirection",
        dataType: "vec3",
        role: "value"
      },
      ambient: {
        name: "inLightAmbient",
        dataType: "vec4",
        role: "value"
      },
      diffuse: {
        name: "inLightDiffuse",
        dataType: "vec4",
        role: "value"
      },
      specular: {
        name: "inLightSpecular",
        dataType: "vec4",
        role: "value"
      },
      attenuation: {
        name: "inLightAttenuation",
        dataType: "vec3",
        role: "value"
      },
      spotExponent: {
        name: "inSpotExponent",
        dataType: "float",
        role: "value"
      },
      spotCutoff: {
        name: "inSpotCutoff",
        dataType: "float",
        role: "value"
      },
      cutoffDistance: {
        name: "inLightCutoffDistance",
        dataType: "float",
        role: "value"
      },
      exposure: {
        name: "inLightExposure",
        dataType: "float",
        role: "value"
      },
      castShadows: {
        name: "inLightCastShadows",
        dataType: "bool",
        role: "value"
      }
    },
    lightingForward: {
      type: {
        name: "inLightType",
        dataType: "int",
        role: "value",
        vec: bg.base.MAX_FORWARD_LIGHTS
      },
      position: {
        name: "inLightPosition",
        dataType: "vec3",
        role: "value",
        vec: bg.base.MAX_FORWARD_LIGHTS
      },
      direction: {
        name: "inLightDirection",
        dataType: "vec3",
        role: "value",
        vec: bg.base.MAX_FORWARD_LIGHTS
      },
      ambient: {
        name: "inLightAmbient",
        dataType: "vec4",
        role: "value",
        vec: bg.base.MAX_FORWARD_LIGHTS
      },
      diffuse: {
        name: "inLightDiffuse",
        dataType: "vec4",
        role: "value",
        vec: bg.base.MAX_FORWARD_LIGHTS
      },
      specular: {
        name: "inLightSpecular",
        dataType: "vec4",
        role: "value",
        vec: bg.base.MAX_FORWARD_LIGHTS
      },
      attenuation: {
        name: "inLightAttenuation",
        dataType: "vec3",
        role: "value",
        vec: bg.base.MAX_FORWARD_LIGHTS
      },
      spotExponent: {
        name: "inSpotExponent",
        dataType: "float",
        role: "value",
        vec: bg.base.MAX_FORWARD_LIGHTS
      },
      spotCutoff: {
        name: "inSpotCutoff",
        dataType: "float",
        role: "value",
        vec: bg.base.MAX_FORWARD_LIGHTS
      },
      cutoffDistance: {
        name: "inLightCutoffDistance",
        dataType: "float",
        role: "value",
        vec: bg.base.MAX_FORWARD_LIGHTS
      },
      exposure: {
        name: "inLightExposure",
        dataType: "float",
        role: "value",
        vec: bg.base.MAX_FORWARD_LIGHTS
      },
      castShadows: {
        name: "inLightCastShadows",
        dataType: "bool",
        role: "value",
        vec: bg.base.MAX_FORWARD_LIGHTS
      },
      numLights: {
        name: "inNumLights",
        dataType: "int",
        role: "value"
      }
    },
    shadows: {
      shadowMap: {
        name: "inShadowMap",
        dataType: "sampler2D",
        role: "value"
      },
      shadowMapSize: {
        name: "inShadowMapSize",
        dataType: "vec2",
        role: "value"
      },
      shadowStrength: {
        name: "inShadowStrength",
        dataType: "float",
        role: "value"
      },
      shadowColor: {
        name: "inShadowColor",
        dataType: "vec4",
        role: "value"
      },
      shadowBias: {
        name: "inShadowBias",
        dataType: "float",
        role: "value"
      },
      shadowType: {
        name: "inShadowType",
        dataType: "int",
        role: "value"
      }
    },
    colorCorrection: {
      hue: {
        name: "inHue",
        dataType: "float",
        role: "value"
      },
      saturation: {
        name: "inSaturation",
        dataType: "float",
        role: "value"
      },
      lightness: {
        name: "inLightness",
        dataType: "float",
        role: "value"
      },
      brightness: {
        name: "inBrightness",
        dataType: "float",
        role: "value"
      },
      contrast: {
        name: "inContrast",
        dataType: "float",
        role: "value"
      }
    }
  };
})();

"use strict";
(function() {
  bg.webgl1.shaderLibrary.functions.lighting = {
    beckmannDistribution: {
      returnType: "float",
      name: "beckmannDistribution",
      params: {
        x: "float",
        roughness: "float"
      },
      body: "\n\t\t\t\t\tfloat NdotH = max(x,0.0001);\n\t\t\t\t\tfloat cos2Alpha = NdotH * NdotH;\n\t\t\t\t\tfloat tan2Alpha = (cos2Alpha - 1.0) / cos2Alpha;\n\t\t\t\t\tfloat roughness2 = roughness * roughness;\n\t\t\t\t\tfloat denom = 3.141592653589793 * roughness2 * cos2Alpha * cos2Alpha;\n\t\t\t\t\treturn exp(tan2Alpha / roughness2) / denom;\n\t\t\t\t"
    },
    beckmannSpecular: {
      returnType: "float",
      name: "beckmannSpecular",
      params: {
        lightDirection: "vec3",
        viewDirection: "vec3",
        surfaceNormal: "vec3",
        roughness: "float"
      },
      body: "\n\t\t\t\t\treturn beckmannDistribution(dot(surfaceNormal, normalize(lightDirection + viewDirection)), roughness);\n\t\t\t\t"
    },
    getDirectionalLight: {
      returnType: "vec4",
      name: "getDirectionalLight",
      params: {
        ambient: "vec4",
        diffuse: "vec4",
        specular: "vec4",
        shininess: "float",
        direction: "vec3",
        vertexPos: "vec3",
        normal: "vec3",
        matDiffuse: "vec4",
        matSpecular: "vec4",
        shadowColor: "vec4"
      },
      body: "\n\t\t\t\tvec3 color = ambient.rgb * matDiffuse.rgb;\n\t\t\t\tvec3 diffuseWeight = max(0.0, dot(normal,direction)) * diffuse.rgb;\n\t\t\t\tcolor += min(diffuseWeight,shadowColor.rgb) * matDiffuse.rgb;\n\t\t\t\tif (shininess>0.0) {\n\t\t\t\t\tvec3 eyeDirection = normalize(-vertexPos);\n\t\t\t\t\tvec3 reflectionDirection = normalize(reflect(-direction,normal));\n\t\t\t\t\tfloat specularWeight = clamp(pow(max(dot(reflectionDirection, eyeDirection), 0.0), shininess), 0.0, 1.0);\n\t\t\t\t\t//sspecularWeight = beckmannSpecular(direction,eyeDirection,normal,0.01);\n\t\t\t\t\tvec3 specularColor = specularWeight * pow(shadowColor.rgb,vec3(10.0));\n\t\t\t\t\tcolor += specularColor * specular.rgb * matSpecular.rgb;\n\t\t\t\t}\n\t\t\t\treturn vec4(color,1.0);"
    },
    getPointLight: {
      returnType: "vec4",
      name: "getPointLight",
      params: {
        ambient: "vec4",
        diffuse: "vec4",
        specular: "vec4",
        shininess: "float",
        position: "vec3",
        constAtt: "float",
        linearAtt: "float",
        expAtt: "float",
        vertexPos: "vec3",
        normal: "vec3",
        matDiffuse: "vec4",
        matSpecular: "vec4"
      },
      body: "\n\t\t\t\tvec3 pointToLight = position - vertexPos;\n\t\t\t\tfloat distance = length(pointToLight);\n\t\t\t\tvec3 lightDir = normalize(pointToLight);\n\t\t\t\tfloat attenuation = 1.0 / (constAtt + linearAtt * distance + expAtt * distance * distance);\n\t\t\t\tvec3 color = ambient.rgb * matDiffuse.rgb;\n\t\t\t\tvec3 diffuseWeight = max(0.0,dot(normal,lightDir)) * diffuse.rgb * attenuation;\n\t\t\t\tcolor += diffuseWeight * matDiffuse.rgb;\n\t\t\t\tif (shininess>0.0) {\n\t\t\t\t\tvec3 eyeDirection = normalize(-vertexPos);\n\t\t\t\t\tvec3 reflectionDirection = normalize(reflect(-lightDir, normal));\n\t\t\t\t\tfloat specularWeight = clamp(pow(max(dot(reflectionDirection,eyeDirection),0.0), shininess), 0.0, 1.0);\n\t\t\t\t\tcolor += specularWeight * specular.rgb * matSpecular.rgb * attenuation;\n\t\t\t\t}\n\t\t\t\treturn vec4(color,1.0);"
    },
    getSpotLight: {
      returnType: "vec4",
      name: "getSpotLight",
      params: {
        ambient: "vec4",
        diffuse: "vec4",
        specular: "vec4",
        shininess: "float",
        position: "vec3",
        direction: "vec3",
        constAtt: "float",
        linearAtt: "float",
        expAtt: "float",
        spotCutoff: "float",
        spotExponent: "float",
        vertexPos: "vec3",
        normal: "vec3",
        matDiffuse: "vec4",
        matSpecular: "vec4",
        shadowColor: "vec4"
      },
      body: "\n\t\t\t\tvec4 matAmbient = vec4(1.0);\n\t\t\t\tvec3 s = normalize(position - vertexPos);\n\t\t\t\tfloat angle = acos(dot(-s, direction));\n\t\t\t\tfloat cutoff = radians(clamp(spotCutoff / 2.0,0.0,90.0));\n\t\t\t\tfloat distance = length(position - vertexPos);\n\t\t\t\tfloat attenuation = 1.0 / (constAtt );//+ linearAtt * distance + expAtt * distance * distance);\n\t\t\t\tif (angle<cutoff) {\n\t\t\t\t\tfloat spotFactor = pow(dot(-s, direction), spotExponent);\n\t\t\t\t\tvec3 v = normalize(vec3(-vertexPos));\n\t\t\t\t\tvec3 h = normalize(v + s);\n\t\t\t\t\tvec3 diffuseAmount = matDiffuse.rgb * diffuse.rgb * max(dot(s, normal), 0.0);\n\t\t\t\t\tif (shininess>0.0) {\n\t\t\t\t\t\tdiffuseAmount += matSpecular.rgb * specular.rgb * pow(max(dot(h,normal), 0.0),shininess);\n\t\t\t\t\t\tdiffuseAmount *= pow(shadowColor.rgb,vec3(10.0));\n\t\t\t\t\t}\n\t\t\t\t\tdiffuseAmount.r = min(diffuseAmount.r, shadowColor.r);\n\t\t\t\t\tdiffuseAmount.g = min(diffuseAmount.g, shadowColor.g);\n\t\t\t\t\tdiffuseAmount.b = min(diffuseAmount.b, shadowColor.b);\n\t\t\t\t\treturn vec4(ambient.rgb * matDiffuse.rgb + attenuation * spotFactor * diffuseAmount,1.0);\n\t\t\t\t}\n\t\t\t\telse {\n\t\t\t\t\treturn vec4(ambient.rgb * matDiffuse.rgb,1.0);\n\t\t\t\t}"
    },
    getLight: {
      returnType: "vec4",
      name: "getLight",
      params: {
        lightType: "int",
        ambient: "vec4",
        diffuse: "vec4",
        specular: "vec4",
        shininess: "float",
        lightPosition: "vec3",
        lightDirection: "vec3",
        constAtt: "float",
        linearAtt: "float",
        expAtt: "float",
        spotCutoff: "float",
        spotExponent: "float",
        cutoffDistance: "float",
        vertexPosition: "vec3",
        vertexNormal: "vec3",
        matDiffuse: "vec4",
        matSpecular: "vec4",
        shadowColor: "vec4"
      },
      body: ("\n\t\t\t\t\tvec4 light = vec4(0.0);\n\t\t\t\t\tif (lightType==" + bg.base.LightType.DIRECTIONAL + ") {\n\t\t\t\t\t\tlight = getDirectionalLight(ambient,diffuse,specular,shininess,\n\t\t\t\t\t\t\t\t\t\t-lightDirection,vertexPosition,vertexNormal,matDiffuse,matSpecular,shadowColor);\n\t\t\t\t\t}\n\t\t\t\t\telse if (lightType==" + bg.base.LightType.SPOT + ") {\n\t\t\t\t\t\tfloat d = distance(vertexPosition,lightPosition);\n\t\t\t\t\t\tif (d<=cutoffDistance || cutoffDistance==-1.0) {\n\t\t\t\t\t\t\tlight = getSpotLight(ambient,diffuse,specular,shininess,\n\t\t\t\t\t\t\t\t\t\t\tlightPosition,lightDirection,\n\t\t\t\t\t\t\t\t\t\t\tconstAtt,linearAtt,expAtt,\n\t\t\t\t\t\t\t\t\t\t\tspotCutoff,spotExponent,\n\t\t\t\t\t\t\t\t\t\t\tvertexPosition,vertexNormal,matDiffuse,matSpecular,shadowColor);\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\telse if (lightType==" + bg.base.LightType.POINT + ") {\n\t\t\t\t\t\tfloat d = distance(vertexPosition,lightPosition);\n\t\t\t\t\t\tif (d<=cutoffDistance || cutoffDistance==-1.0) {\n\t\t\t\t\t\t\tlight = getPointLight(ambient,diffuse,specular,shininess,\n\t\t\t\t\t\t\t\t\t\t\tlightPosition,\n\t\t\t\t\t\t\t\t\t\t\tconstAtt,linearAtt,expAtt,\n\t\t\t\t\t\t\t\t\t\t\tvertexPosition,vertexNormal,matDiffuse,matSpecular);\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\treturn light;\n\t\t\t\t")
    },
    getShadowColor: {
      returnType: "vec4",
      name: "getShadowColor",
      params: {
        vertexPosFromLight: 'vec4',
        shadowMap: 'sampler2D',
        shadowMapSize: 'vec2',
        shadowType: 'int',
        shadowStrength: 'float',
        shadowBias: 'float',
        shadowColor: 'vec4'
      },
      body: ("\n\t\t\t\tfloat visibility = 1.0;\n\t\t\t\tvec3 depth = vertexPosFromLight.xyz / vertexPosFromLight.w;\n\t\t\t\tconst float kShadowBorderOffset = 3.0;\n\t\t\t\tfloat shadowBorderOffset = kShadowBorderOffset / shadowMapSize.x;\n\t\t\t\tfloat bias = shadowBias;\n\t\t\t\tvec4 shadow = vec4(1.0);\n\t\t\t\tif (shadowType==" + bg.base.ShadowType.HARD + ") {\t// hard\n\t\t\t\t\tfloat shadowDepth = unpack(texture2D(shadowMap,depth.xy));\n\t\t\t\t\tif (shadowDepth<depth.z - bias &&\n\t\t\t\t\t\t(depth.x>0.0 && depth.x<1.0 && depth.y>0.0 && depth.y<1.0))\n\t\t\t\t\t{\n\t\t\t\t\t\tvisibility = 1.0 - shadowStrength;\n\t\t\t\t\t}\n\t\t\t\t\tshadow = clamp(shadowColor + visibility,0.0,1.0);\n\t\t\t\t}\n\t\t\t\telse if (shadowType>=" + bg.base.ShadowType.SOFT + ") {\t// soft / soft stratified (not supported on webgl, fallback to soft)\n\t\t\t\t\tvec2 poissonDisk[4];\n\t\t\t\t\tpoissonDisk[0] = vec2( -0.94201624, -0.39906216 );\n\t\t\t\t\tpoissonDisk[1] = vec2( 0.94558609, -0.76890725 );\n\t\t\t\t\tpoissonDisk[2] = vec2( -0.094184101, -0.92938870 );\n\t\t\t\t\tpoissonDisk[3] = vec2( 0.34495938, 0.29387760 );\n\t\t\t\t\t\n\t\t\t\t\tfor (int i=0; i<4; ++i) {\n\t\t\t\t\t\tfloat shadowDepth = unpack(texture2D(shadowMap, depth.xy + poissonDisk[i]/1000.0));\n\t\t\t\t\t\t\n\t\t\t\t\t\tif (shadowDepth<depth.z - bias\n\t\t\t\t\t\t\t&& (depth.x>0.0 && depth.x<1.0 && depth.y>0.0 && depth.y<1.0)) {\n\t\t\t\t\t\t\tvisibility -= (shadowStrength) * 0.25;\n\t\t\t\t\t\t}\n\t\t\t\t\t}\n\t\t\t\t\tshadow = clamp(shadowColor + visibility,0.0,1.0);\n\t\t\t\t}\n\t\t\t\treturn shadow;")
    }
  };
})();

"use strict";
(function() {
  bg.webgl1.shaderLibrary.functions.materials = {
    samplerColor: {
      returnType: "vec4",
      name: "samplerColor",
      params: {
        sampler: "sampler2D",
        uv: "vec2",
        offset: "vec2",
        scale: "vec2"
      },
      body: "\n\t\t\t\treturn texture2D(sampler,uv * scale + offset);"
    },
    samplerNormal: {
      returnType: "vec3",
      name: "samplerNormal",
      params: {
        sampler: "sampler2D",
        uv: "vec2",
        offset: "vec2",
        scale: "vec2"
      },
      body: "\n\t\t\t\treturn normalize(samplerColor(sampler,uv,offset,scale).xyz * 2.0 - 1.0);\n\t\t\t\t"
    },
    combineNormalWithMap: {
      returnType: "vec3",
      name: "combineNormalWithMap",
      params: {
        normalCoord: "vec3",
        tangent: "vec3",
        bitangent: "vec3",
        normalMapValue: "vec3"
      },
      body: "\n\t\t\t\tmat3 tbnMat = mat3( tangent.x, bitangent.x, normalCoord.x,\n\t\t\t\t\t\t\ttangent.y, bitangent.y, normalCoord.y,\n\t\t\t\t\t\t\ttangent.z, bitangent.z, normalCoord.z\n\t\t\t\t\t\t);\n\t\t\t\treturn normalize(normalMapValue * tbnMat);"
    },
    applyTextureMask: {
      returnType: "float",
      name: "applyTextureMask",
      params: {
        value: "float",
        textureMask: "sampler2D",
        uv: "vec2",
        offset: "vec2",
        scale: "vec2",
        channelMask: "vec4",
        invert: "bool"
      },
      body: "\n\t\t\t\tfloat mask;\n\t\t\t\tvec4 color = samplerColor(textureMask,uv,offset,scale);\n\t\t\t\tmask = color.r * channelMask.r +\n\t\t\t\t\t\t color.g * channelMask.g +\n\t\t\t\t\t\t color.b * channelMask.b +\n\t\t\t\t\t\t color.a * channelMask.a;\n\t\t\t\tif (invert) {\n\t\t\t\t\tmask = 1.0 - mask;\n\t\t\t\t}\n\t\t\t\treturn value * mask;"
    },
    specularColor: {
      returnType: "vec4",
      name: "specularColor",
      params: {
        specular: "vec4",
        shininessMask: "sampler2D",
        uv: "vec2",
        offset: "vec2",
        scale: "vec2",
        channelMask: "vec4",
        invert: "bool"
      },
      body: "\n\t\t\t\tfloat maskValue = applyTextureMask(1.0, shininessMask,uv,offset,scale,channelMask,invert);\n\t\t\t\treturn vec4(specular.rgb * maskValue, 1.0);"
    }
  };
})();

"use strict";
(function() {
  bg.webgl1.shaderLibrary.functions.utils = {
    pack: {
      returnType: "vec4",
      name: "pack",
      params: {depth: "float"},
      body: "\n\t\t\t\tconst vec4 bitSh = vec4(256 * 256 * 256,\n\t\t\t\t\t\t\t\t\t\t256 * 256,\n\t\t\t\t\t\t\t\t\t\t256,\n\t\t\t\t\t\t\t\t\t\t1.0);\n\t\t\t\tconst vec4 bitMsk = vec4(0,\n\t\t\t\t\t\t\t\t\t\t1.0 / 256.0,\n\t\t\t\t\t\t\t\t\t\t1.0 / 256.0,\n\t\t\t\t\t\t\t\t\t\t1.0 / 256.0);\n\t\t\t\tvec4 comp = fract(depth * bitSh);\n\t\t\t\tcomp -= comp.xxyz * bitMsk;\n\t\t\t\treturn comp;"
    },
    unpack: {
      returnType: "float",
      name: "unpack",
      params: {color: "vec4"},
      body: "\n\t\t\t\tconst vec4 bitShifts = vec4(1.0 / (256.0 * 256.0 * 256.0),\n\t\t\t\t\t\t\t\t\t\t\t1.0 / (256.0 * 256.0),\n\t\t\t\t\t\t\t\t\t\t\t1.0 / 256.0,\n\t\t\t\t\t\t\t\t\t\t\t1.0);\n\t\t\t\treturn dot(color, bitShifts);"
    },
    random: {
      returnType: "float",
      name: "random",
      params: {
        seed: "vec3",
        i: "int"
      },
      body: "\n\t\t\t\tvec4 seed4 = vec4(seed,i);\n\t\t\t\tfloat dot_product = dot(seed4, vec4(12.9898,78.233,45.164,94.673));\n\t\t\t\treturn fract(sin(dot_product) * 43758.5453);"
    },
    texOffset: {
      returnType: 'vec4',
      name: 'texOffset',
      params: {
        sampler: 'sampler2D',
        texCoord: 'vec2',
        offset: 'vec2',
        frameSize: 'vec2'
      },
      body: "\n\t\t\t\treturn texture2D(sampler,texCoord + vec2(offset.x * 1.0/frameSize.x,offset.y * 1.0 / frameSize.y));\n\t\t\t\t"
    },
    luminance: {
      returnType: 'float',
      name: 'luminance',
      params: {color: 'vec3'},
      body: "\n\t\t\t\treturn dot(vec3(0.2126,0.7152,0.0722), color);\n\t\t\t\t"
    },
    borderDetection: {
      returnType: 'float',
      name: 'borderDetection',
      params: {
        sampler: 'sampler2D',
        texCoord: 'vec2',
        frameSize: 'vec2'
      },
      body: "\n\t\t\t\tfloat s00 = luminance(texOffset(sampler,texCoord,vec2(-1.0, 1.0),frameSize).rgb);\n\t\t\t\tfloat s10 = luminance(texOffset(sampler,texCoord,vec2(-1.0, 0.0),frameSize).rgb);\n\t\t\t\tfloat s20 = luminance(texOffset(sampler,texCoord,vec2(-1.0,-1.0),frameSize).rgb);\n\t\t\t\tfloat s01 = luminance(texOffset(sampler,texCoord,vec2(-1.0, 1.0),frameSize).rgb);\n\t\t\t\tfloat s21 = luminance(texOffset(sampler,texCoord,vec2( 0.0,-1.0),frameSize).rgb);\n\t\t\t\tfloat s02 = luminance(texOffset(sampler,texCoord,vec2( 1.0, 1.0),frameSize).rgb);\n\t\t\t\tfloat s12 = luminance(texOffset(sampler,texCoord,vec2( 1.0, 0.0),frameSize).rgb);\n\t\t\t\tfloat s22 = luminance(texOffset(sampler,texCoord,vec2( 1.0,-1.0),frameSize).rgb);\n\n\t\t\t\tfloat sx = s00 + 2.0 * s10 + s20 - (s02 + 2.0 * s12 + s22);\n\t\t\t\tfloat sy = s00 + 2.0 * s01 + s02 - (s20 + 2.0 * s21 + s22);\n\n\t\t\t\treturn sx * sx + sy * sy;\n\t\t\t\t"
    },
    applyConvolution: {
      returnType: 'vec4',
      name: 'applyConvolution',
      params: {
        texture: 'sampler2D',
        texCoord: 'vec2',
        texSize: 'vec2',
        convMatrix: 'float[9]',
        radius: 'float'
      },
      body: "\n\t\t\t\tvec2 onePixel = vec2(1.0,1.0) / texSize * radius;\n\t\t\t\tvec4 colorSum = \n\t\t\t\t\ttexture2D(texture, texCoord + onePixel * vec2(-1, -1)) * convMatrix[0] +\n\t\t\t\t\ttexture2D(texture, texCoord + onePixel * vec2( 0, -1)) * convMatrix[1] +\n\t\t\t\t\ttexture2D(texture, texCoord + onePixel * vec2( 1, -1)) * convMatrix[2] +\n\t\t\t\t\ttexture2D(texture, texCoord + onePixel * vec2(-1,  0)) * convMatrix[3] +\n\t\t\t\t\ttexture2D(texture, texCoord + onePixel * vec2( 0,  0)) * convMatrix[4] +\n\t\t\t\t\ttexture2D(texture, texCoord + onePixel * vec2( 1,  0)) * convMatrix[5] +\n\t\t\t\t\ttexture2D(texture, texCoord + onePixel * vec2(-1,  1)) * convMatrix[6] +\n\t\t\t\t\ttexture2D(texture, texCoord + onePixel * vec2( 0,  1)) * convMatrix[7] +\n\t\t\t\t\ttexture2D(texture, texCoord + onePixel * vec2( 1,  1)) * convMatrix[8];\n\t\t\t\tfloat kernelWeight =\n\t\t\t\t\tconvMatrix[0] +\n\t\t\t\t\tconvMatrix[1] +\n\t\t\t\t\tconvMatrix[2] +\n\t\t\t\t\tconvMatrix[3] +\n\t\t\t\t\tconvMatrix[4] +\n\t\t\t\t\tconvMatrix[5] +\n\t\t\t\t\tconvMatrix[6] +\n\t\t\t\t\tconvMatrix[7] +\n\t\t\t\t\tconvMatrix[8];\n\t\t\t\tif (kernelWeight <= 0.0) {\n\t\t\t\t\tkernelWeight = 1.0;\n\t\t\t\t}\n\t\t\t\treturn vec4((colorSum / kernelWeight).rgb, 1.0);\n\t\t\t\t"
    }
  };
})();

"use strict";
(function() {
  var ShaderImpl = function($__super) {
    function ShaderImpl() {
      $traceurRuntime.superConstructor(ShaderImpl).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(ShaderImpl, {
      initFlags: function(context) {
        bg.base.ShaderType.VERTEX = context.VERTEX_SHADER;
        bg.base.ShaderType.FRAGMENT = context.FRAGMENT_SHADER;
      },
      setActive: function(context, shaderProgram) {
        context.useProgram(shaderProgram && shaderProgram.program);
      },
      create: function(context) {
        return {
          program: context.createProgram(),
          attribLocations: {},
          uniformLocations: {}
        };
      },
      addShaderSource: function(context, shaderProgram, shaderType, source) {
        var error = null;
        if (!shaderProgram || !shaderProgram.program) {
          error = "Could not attach shader. Invalid shader program";
        } else {
          var shader = context.createShader(shaderType);
          context.shaderSource(shader, source);
          context.compileShader(shader);
          if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
            error = context.getShaderInfoLog(shader);
          } else {
            context.attachShader(shaderProgram.program, shader);
          }
          context.deleteShader(shader);
        }
        return error;
      },
      link: function(context, shaderProgram) {
        var error = null;
        if (!shaderProgram || !shaderProgram.program) {
          error = "Could not link shader. Invalid shader program";
        } else {
          context.linkProgram(shaderProgram.program);
          if (!context.getProgramParameter(shaderProgram.program, context.LINK_STATUS)) {
            error = context.getProgramInfoLog(shaderProgram.program);
          }
        }
        return error;
      },
      initVars: function(context, shader, inputBufferVars, valueVars) {
        inputBufferVars.forEach(function(name) {
          shader.attribLocations[name] = context.getAttribLocation(shader.program, name);
        });
        valueVars.forEach(function(name) {
          shader.uniformLocations[name] = context.getUniformLocation(shader.program, name);
        });
      },
      setInputBuffer: function(context, shader, varName, vertexBuffer, itemSize) {
        if (vertexBuffer && shader && shader.program) {
          var loc = shader.attribLocations[varName];
          if (loc != -1) {
            context.bindBuffer(context.ARRAY_BUFFER, vertexBuffer);
            context.enableVertexAttribArray(loc);
            context.vertexAttribPointer(loc, itemSize, context.FLOAT, false, 0, 0);
          }
        }
      },
      disableInputBuffer: function(context, shader, name) {
        context.disableVertexAttribArray(shader.attribLocations[name]);
      },
      setValueInt: function(context, shader, name, v) {
        context.uniform1i(shader.uniformLocations[name], v);
      },
      setValueIntPtr: function(context, shader, name, v) {
        context.uniform1iv(shader.uniformLocations[name], v);
      },
      setValueFloat: function(context, shader, name, v) {
        context.uniform1f(shader.uniformLocations[name], v);
      },
      setValueFloatPtr: function(context, shader, name, v) {
        context.uniform1fv(shader.uniformLocations[name], v);
      },
      setValueVector2: function(context, shader, name, v) {
        context.uniform2fv(shader.uniformLocations[name], v.v);
      },
      setValueVector3: function(context, shader, name, v) {
        context.uniform3fv(shader.uniformLocations[name], v.v);
      },
      setValueVector4: function(context, shader, name, v) {
        context.uniform4fv(shader.uniformLocations[name], v.v);
      },
      setValueVector2v: function(context, shader, name, v) {
        context.uniform2fv(shader.uniformLocations[name], v);
      },
      setValueVector3v: function(context, shader, name, v) {
        context.uniform3fv(shader.uniformLocations[name], v);
      },
      setValueVector4v: function(context, shader, name, v) {
        context.uniform4fv(shader.uniformLocations[name], v);
      },
      setValueMatrix3: function(context, shader, name, traspose, v) {
        context.uniformMatrix3fv(shader.uniformLocations[name], traspose, v.m);
      },
      setValueMatrix4: function(context, shader, name, traspose, v) {
        context.uniformMatrix4fv(shader.uniformLocations[name], traspose, v.m);
      },
      setTexture: function(context, shader, name, texture, textureUnit) {
        texture.setActive(textureUnit);
        texture.bind();
        context.uniform1i(shader.uniformLocations[name], textureUnit);
      }
    }, {}, $__super);
  }(bg.base.ShaderImpl);
  bg.webgl1.ShaderImpl = ShaderImpl;
})();

"use strict";
(function() {
  var TextureImpl = function($__super) {
    function TextureImpl() {
      $traceurRuntime.superConstructor(TextureImpl).apply(this, arguments);
    }
    return ($traceurRuntime.createClass)(TextureImpl, {
      initFlags: function(context) {
        bg.base.TextureWrap.REPEAT = context.REPEAT;
        bg.base.TextureWrap.CLAMP = context.CLAMP_TO_EDGE;
        bg.base.TextureWrap.MIRRORED_REPEAT = context.MIRRORED_REPEAT;
        bg.base.TextureFilter.NEAREST_MIPMAP_NEAREST = context.NEAREST_MIPMAP_NEAREST;
        bg.base.TextureFilter.LINEAR_MIPMAP_NEAREST = context.LINEAR_MIPMAP_NEAREST;
        bg.base.TextureFilter.NEAREST_MIPMAP_LINEAR = context.NEAREST_MIPMAP_LINEAR;
        bg.base.TextureFilter.LINEAR_MIPMAP_LINEAR = context.LINEAR_MIPMAP_LINEAR;
        bg.base.TextureFilter.NEAREST = context.NEAREST;
        bg.base.TextureFilter.LINEAR = context.LINEAR;
        bg.base.TextureTarget.TEXTURE_2D = context.TEXTURE_2D;
        bg.base.TextureTarget.CUBE_MAP = context.TEXTURE_CUBE_MAP;
        bg.base.TextureTarget.POSITIVE_X_FACE = context.TEXTURE_CUBE_MAP_POSITIVE_X;
        bg.base.TextureTarget.NEGATIVE_X_FACE = context.TEXTURE_CUBE_MAP_NEGATIVE_X;
        bg.base.TextureTarget.POSITIVE_Y_FACE = context.TEXTURE_CUBE_MAP_POSITIVE_Y;
        bg.base.TextureTarget.NEGATIVE_Y_FACE = context.TEXTURE_CUBE_MAP_NEGATIVE_Y;
        bg.base.TextureTarget.POSITIVE_Z_FACE = context.TEXTURE_CUBE_MAP_POSITIVE_Z;
        bg.base.TextureTarget.NEGATIVE_Z_FACE = context.TEXTURE_CUBE_MAP_NEGATIVE_Z;
      },
      requireMipmaps: function(minFilter, magFilter) {
        return minFilter == bg.base.TextureFilter.NEAREST_MIPMAP_NEAREST || minFilter == bg.base.TextureFilter.LINEAR_MIPMAP_NEAREST || minFilter == bg.base.TextureFilter.NEAREST_MIPMAP_LINEAR || minFilter == bg.base.TextureFilter.LINEAR_MIPMAP_LINEAR || magFilter == bg.base.TextureFilter.NEAREST_MIPMAP_NEAREST || magFilter == bg.base.TextureFilter.LINEAR_MIPMAP_NEAREST || magFilter == bg.base.TextureFilter.NEAREST_MIPMAP_LINEAR || magFilter == bg.base.TextureFilter.LINEAR_MIPMAP_LINEAR;
      },
      create: function(context) {
        return context.createTexture();
      },
      setActive: function(context, texUnit) {
        context.activeTexture(context.TEXTURE0 + texUnit);
      },
      bind: function(context, target, texture) {
        context.bindTexture(target, texture);
      },
      unbind: function(context, target) {
        this.bind(context, target, null);
      },
      setTextureWrapX: function(context, target, texture, wrap) {
        context.texParameteri(target, context.TEXTURE_WRAP_S, wrap);
      },
      setTextureWrapY: function(context, target, texture, wrap) {
        context.texParameteri(target, context.TEXTURE_WRAP_T, wrap);
      },
      setImage: function(context, target, minFilter, magFilter, texture, img, flipY) {
        if (flipY)
          context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, true);
        context.texParameteri(target, context.TEXTURE_MIN_FILTER, minFilter);
        context.texParameteri(target, context.TEXTURE_MAG_FILTER, magFilter);
        context.texImage2D(target, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, img);
        if (this.requireMipmaps(minFilter, magFilter)) {
          context.generateMipmap(target);
        }
      },
      setImageRaw: function(context, target, minFilter, magFilter, texture, width, height, data, type, format) {
        if (!type) {
          type = context.RGBA;
        }
        if (!format) {
          format = context.UNSIGNED_BYTE;
        }
        if (format == bg.base.RenderSurfaceFormat.FLOAT) {
          minFilter = bg.base.TextureFilter.NEAREST;
          magFilter = bg.base.TextureFilter.NEAREST;
        }
        context.texParameteri(target, context.TEXTURE_MIN_FILTER, minFilter);
        context.texParameteri(target, context.TEXTURE_MAG_FILTER, magFilter);
        context.texImage2D(target, 0, type, width, height, 0, type, format, data);
        if (this.requireMipmaps(minFilter, magFilter)) {
          context.generateMipmap(target);
        }
      },
      setTextureFilter: function(context, target, minFilter, magFilter) {
        context.texParameteri(target, context.TEXTURE_MIN_FILTER, minFilter);
        context.texParameteri(target, context.TEXTURE_MAG_FILTER, magFilter);
      },
      setCubemapImage: function(context, face, image) {
        context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, false);
        context.texImage2D(face, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, image);
        context.generateMipmap(face);
      },
      setCubemapRaw: function(context, face, rawImage, w, h) {
        var type = context.RGBA;
        var format = context.UNSIGNED_BYTE;
        context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, false);
        context.texImage2D(face, 0, type, w, h, 0, type, format, rawImage);
        context.generateMipmap(face);
      },
      setVideo: function(context, target, texture, video, flipY) {
        if (flipY)
          context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, false);
        context.texParameteri(target, context.TEXTURE_MAG_FILTER, context.LINEAR);
        context.texParameteri(target, context.TEXTURE_MIN_FILTER, context.LINEAR);
        context.texParameteri(target, context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
        context.texParameteri(target, context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
        context.texImage2D(target, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, video);
      },
      updateVideoData: function(context, target, texture, video) {
        context.bindTexture(target, texture);
        context.texImage2D(target, 0, context.RGBA, context.RGBA, context.UNSIGNED_BYTE, video);
        context.bindTexture(target, null);
      },
      destroy: function(context, texture) {
        context.deleteTexture(this._texture);
      }
    }, {}, $__super);
  }(bg.base.TextureImpl);
  bg.webgl1.TextureImpl = TextureImpl;
})();
