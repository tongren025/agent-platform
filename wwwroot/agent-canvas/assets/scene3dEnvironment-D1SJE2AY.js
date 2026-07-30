import { cH as Be, aa as Tn, c8 as J, S as Ie } from "./agentStudioMount-Dd-4ILXh.js";
import { S as Uo, a as Co, W as Ao } from "./three.module-DbUzIx2U.js";
import { fk as Ht, B as Ca, gc as Aa, gn as nr, d3 as Xr, L as Fo, bI as ko, aY as Vt, aL as Fa, bF as Fr, bk as zr, aM as et, cv as Ur, ej as yt, eY as Ro, d6 as Do, d5 as Io, ei as Oo, d4 as ka, aa as tt, d1 as qr, gm as Gt, bP as Lo, fv as Po, J as Bo, bO as Go, fU as Yr, d0 as No, dY as St, go as na, a8 as Nr, fj as Ra, dS as zo, gw as Da, g5 as _t, aK as Wo, cB as vn, bV as Ho, fq as Vo, Q as jo, gh as Xo, gd as pn, cE as Zo, cG as Yo, cx as aa, fh as Ia, bh as Lt, dt as Ko, ao as qo, b7 as Un, ar as Jo, n as Oa, gp as Qo, ea as $o, l as La, fs as ei, e9 as bt, b9 as Et, c6 as Pa, cb as ri, ca as ti, c7 as ni, c8 as ai, cJ as oi, c9 as ii, ft as Ba, cK as Ga, Y as si, bo as li, _ as sn, f7 as jt, dF as Cn, Z as ui, cO as ci, cN as fi, cP as Na, fw as hi, f1 as di, cz as vi, fV as pi } from "./scene3dConstants-DlRfsgmW.js";
import { a as gi, p as mi } from "./scene3dPropSpecs-CT7N5sBG.js";
import { e as yi, Q as za, aa as _i, a0 as wi, p as xi, f as Si, ac as Wa, ai as An, E as Fn, G as Ha, D as Va, H as bi, ah as Nt, K as Ei } from "./scene3dSerializer-CA8L6Op6.js";
import { v as kn, f as Pr, s as Mi, d as wt, e as Ti, u as Xt, c as Ui, a as oa, b as Zt } from "./Gltf-DIe9tkBg.js";
var Ar = Uint8Array, jr = Uint16Array, gn = Uint32Array, ja = new Ar([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  2,
  2,
  2,
  2,
  3,
  3,
  3,
  3,
  4,
  4,
  4,
  4,
  5,
  5,
  5,
  5,
  0,
  /* unused */
  0,
  0,
  /* impossible */
  0
]), Xa = new Ar([
  0,
  0,
  0,
  0,
  1,
  1,
  2,
  2,
  3,
  3,
  4,
  4,
  5,
  5,
  6,
  6,
  7,
  7,
  8,
  8,
  9,
  9,
  10,
  10,
  11,
  11,
  12,
  12,
  13,
  13,
  /* unused */
  0,
  0
]), Ci = new Ar([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), Za = function(o, r) {
  for (var u = new jr(31), c = 0; c < 31; ++c)
    u[c] = r += 1 << o[c - 1];
  for (var t = new gn(u[30]), c = 1; c < 30; ++c)
    for (var e = u[c]; e < u[c + 1]; ++e)
      t[e] = e - u[c] << 5 | c;
  return [u, t];
}, Ya = Za(ja, 2), Ka = Ya[0], Ai = Ya[1];
Ka[28] = 258, Ai[258] = 28;
var Fi = Za(Xa, 0), ki = Fi[0], mn = new jr(32768);
for (var ar = 0; ar < 32768; ++ar) {
  var Vr = (ar & 43690) >>> 1 | (ar & 21845) << 1;
  Vr = (Vr & 52428) >>> 2 | (Vr & 13107) << 2, Vr = (Vr & 61680) >>> 4 | (Vr & 3855) << 4, mn[ar] = ((Vr & 65280) >>> 8 | (Vr & 255) << 8) >>> 1;
}
var pt = (function(o, r, u) {
  for (var c = o.length, t = 0, e = new jr(r); t < c; ++t)
    ++e[o[t] - 1];
  var n = new jr(r);
  for (t = 0; t < r; ++t)
    n[t] = n[t - 1] + e[t - 1] << 1;
  var s;
  if (u) {
    s = new jr(1 << r);
    var a = 15 - r;
    for (t = 0; t < c; ++t)
      if (o[t])
        for (var i = t << 4 | o[t], l = r - o[t], h = n[o[t] - 1]++ << l, d = h | (1 << l) - 1; h <= d; ++h)
          s[mn[h] >>> a] = i;
  } else
    for (s = new jr(c), t = 0; t < c; ++t)
      o[t] && (s[t] = mn[n[o[t] - 1]++] >>> 15 - o[t]);
  return s;
}), Mt = new Ar(288);
for (var ar = 0; ar < 144; ++ar)
  Mt[ar] = 8;
for (var ar = 144; ar < 256; ++ar)
  Mt[ar] = 9;
for (var ar = 256; ar < 280; ++ar)
  Mt[ar] = 7;
for (var ar = 280; ar < 288; ++ar)
  Mt[ar] = 8;
var qa = new Ar(32);
for (var ar = 0; ar < 32; ++ar)
  qa[ar] = 5;
var Ri = /* @__PURE__ */ pt(Mt, 9, 1), Di = /* @__PURE__ */ pt(qa, 5, 1), ln = function(o) {
  for (var r = o[0], u = 1; u < o.length; ++u)
    o[u] > r && (r = o[u]);
  return r;
}, Or = function(o, r, u) {
  var c = r / 8 | 0;
  return (o[c] | o[c + 1] << 8) >> (r & 7) & u;
}, un = function(o, r) {
  var u = r / 8 | 0;
  return (o[u] | o[u + 1] << 8 | o[u + 2] << 16) >> (r & 7);
}, Ii = function(o) {
  return (o / 8 | 0) + (o & 7 && 1);
}, Oi = function(o, r, u) {
  (u == null || u > o.length) && (u = o.length);
  var c = new (o instanceof jr ? jr : o instanceof gn ? gn : Ar)(u - r);
  return c.set(o.subarray(r, u)), c;
}, Li = function(o, r, u) {
  var c = o.length;
  if (!c || u && !u.l && c < 5)
    return r || new Ar(0);
  var t = !r || u, e = !u || u.i;
  u || (u = {}), r || (r = new Ar(c * 3));
  var n = function(V) {
    var j = r.length;
    if (V > j) {
      var Y = new Ar(Math.max(j * 2, V));
      Y.set(r), r = Y;
    }
  }, s = u.f || 0, a = u.p || 0, i = u.b || 0, l = u.l, h = u.d, d = u.m, p = u.n, g = c * 8;
  do {
    if (!l) {
      u.f = s = Or(o, a, 1);
      var S = Or(o, a + 1, 3);
      if (a += 3, S)
        if (S == 1)
          l = Ri, h = Di, d = 9, p = 5;
        else if (S == 2) {
          var k = Or(o, a, 31) + 257, T = Or(o, a + 10, 15) + 4, U = k + Or(o, a + 5, 31) + 1;
          a += 14;
          for (var O = new Ar(U), C = new Ar(19), y = 0; y < T; ++y)
            C[Ci[y]] = Or(o, a + y * 3, 7);
          a += T * 3;
          for (var M = ln(C), L = (1 << M) - 1, ee = pt(C, M, 1), y = 0; y < U; ) {
            var x = ee[Or(o, a, L)];
            a += x & 15;
            var w = x >>> 4;
            if (w < 16)
              O[y++] = w;
            else {
              var R = 0, b = 0;
              for (w == 16 ? (b = 3 + Or(o, a, 3), a += 2, R = O[y - 1]) : w == 17 ? (b = 3 + Or(o, a, 7), a += 3) : w == 18 && (b = 11 + Or(o, a, 127), a += 7); b--; )
                O[y++] = R;
            }
          }
          var K = O.subarray(0, k), H = O.subarray(k);
          d = ln(K), p = ln(H), l = pt(K, d, 1), h = pt(H, p, 1);
        } else
          throw "invalid block type";
      else {
        var w = Ii(a) + 4, I = o[w - 4] | o[w - 3] << 8, A = w + I;
        if (A > c) {
          if (e)
            throw "unexpected EOF";
          break;
        }
        t && n(i + I), r.set(o.subarray(w, A), i), u.b = i += I, u.p = a = A * 8;
        continue;
      }
      if (a > g) {
        if (e)
          throw "unexpected EOF";
        break;
      }
    }
    t && n(i + 131072);
    for (var se = (1 << d) - 1, he = (1 << p) - 1, Z = a; ; Z = a) {
      var R = l[un(o, a) & se], G = R >>> 4;
      if (a += R & 15, a > g) {
        if (e)
          throw "unexpected EOF";
        break;
      }
      if (!R)
        throw "invalid length/literal";
      if (G < 256)
        r[i++] = G;
      else if (G == 256) {
        Z = a, l = null;
        break;
      } else {
        var _ = G - 254;
        if (G > 264) {
          var y = G - 257, E = ja[y];
          _ = Or(o, a, (1 << E) - 1) + Ka[y], a += E;
        }
        var D = h[un(o, a) & he], N = D >>> 4;
        if (!D)
          throw "invalid distance";
        a += D & 15;
        var H = ki[N];
        if (N > 3) {
          var E = Xa[N];
          H += un(o, a) & (1 << E) - 1, a += E;
        }
        if (a > g) {
          if (e)
            throw "unexpected EOF";
          break;
        }
        t && n(i + 131072);
        for (var B = i + _; i < B; i += 4)
          r[i] = r[i - H], r[i + 1] = r[i + 1 - H], r[i + 2] = r[i + 2 - H], r[i + 3] = r[i + 3 - H];
        i = B;
      }
    }
    u.l = l, u.p = Z, u.b = i, l && (s = 1, u.m = d, u.d = h, u.n = p);
  } while (!s);
  return i == r.length ? r : Oi(r, 0, i);
}, Pi = /* @__PURE__ */ new Ar(0), Bi = function(o) {
  if ((o[0] & 15) != 8 || o[0] >>> 4 > 7 || (o[0] << 8 | o[1]) % 31)
    throw "invalid zlib data";
  if (o[1] & 32)
    throw "invalid zlib data: preset dictionaries not supported";
};
function Rt(o, r) {
  return Li((Bi(o), o.subarray(2, -4)), r);
}
var Gi = typeof TextDecoder < "u" && /* @__PURE__ */ new TextDecoder(), Ni = 0;
try {
  Gi.decode(Pi, { stream: !0 }), Ni = 1;
} catch {
}
var zi = Object.defineProperty, Wi = (o, r, u) => r in o ? zi(o, r, { enumerable: !0, configurable: !0, writable: !0, value: u }) : o[r] = u, ia = (o, r, u) => (Wi(o, typeof r != "symbol" ? r + "" : r, u), u);
const Hi = /* @__PURE__ */ (() => {
  const o = {
    uniforms: {
      turbidity: { value: 2 },
      rayleigh: { value: 1 },
      mieCoefficient: { value: 5e-3 },
      mieDirectionalG: { value: 0.8 },
      sunPosition: { value: new nr() },
      up: { value: new nr(0, 1, 0) }
    },
    vertexShader: (
      /* glsl */
      `
      uniform vec3 sunPosition;
      uniform float rayleigh;
      uniform float turbidity;
      uniform float mieCoefficient;
      uniform vec3 up;

      varying vec3 vWorldPosition;
      varying vec3 vSunDirection;
      varying float vSunfade;
      varying vec3 vBetaR;
      varying vec3 vBetaM;
      varying float vSunE;

      // constants for atmospheric scattering
      const float e = 2.71828182845904523536028747135266249775724709369995957;
      const float pi = 3.141592653589793238462643383279502884197169;

      // wavelength of used primaries, according to preetham
      const vec3 lambda = vec3( 680E-9, 550E-9, 450E-9 );
      // this pre-calcuation replaces older TotalRayleigh(vec3 lambda) function:
      // (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * pn)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * pn))
      const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );

      // mie stuff
      // K coefficient for the primaries
      const float v = 4.0;
      const vec3 K = vec3( 0.686, 0.678, 0.666 );
      // MieConst = pi * pow( ( 2.0 * pi ) / lambda, vec3( v - 2.0 ) ) * K
      const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );

      // earth shadow hack
      // cutoffAngle = pi / 1.95;
      const float cutoffAngle = 1.6110731556870734;
      const float steepness = 1.5;
      const float EE = 1000.0;

      float sunIntensity( float zenithAngleCos ) {
        zenithAngleCos = clamp( zenithAngleCos, -1.0, 1.0 );
        return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( zenithAngleCos ) ) / steepness ) ) );
      }

      vec3 totalMie( float T ) {
        float c = ( 0.2 * T ) * 10E-18;
        return 0.434 * c * MieConst;
      }

      void main() {

        vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
        vWorldPosition = worldPosition.xyz;

        gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        gl_Position.z = gl_Position.w; // set z to camera.far

        vSunDirection = normalize( sunPosition );

        vSunE = sunIntensity( dot( vSunDirection, up ) );

        vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );

        float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );

      // extinction (absorbtion + out scattering)
      // rayleigh coefficients
        vBetaR = totalRayleigh * rayleighCoefficient;

      // mie coefficients
        vBetaM = totalMie( turbidity ) * mieCoefficient;

      }
    `
    ),
    fragmentShader: (
      /* glsl */
      `
      varying vec3 vWorldPosition;
      varying vec3 vSunDirection;
      varying float vSunfade;
      varying vec3 vBetaR;
      varying vec3 vBetaM;
      varying float vSunE;

      uniform float mieDirectionalG;
      uniform vec3 up;

      const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );

      // constants for atmospheric scattering
      const float pi = 3.141592653589793238462643383279502884197169;

      const float n = 1.0003; // refractive index of air
      const float N = 2.545E25; // number of molecules per unit volume for air at 288.15K and 1013mb (sea level -45 celsius)

      // optical length at zenith for molecules
      const float rayleighZenithLength = 8.4E3;
      const float mieZenithLength = 1.25E3;
      // 66 arc seconds -> degrees, and the cosine of that
      const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

      // 3.0 / ( 16.0 * pi )
      const float THREE_OVER_SIXTEENPI = 0.05968310365946075;
      // 1.0 / ( 4.0 * pi )
      const float ONE_OVER_FOURPI = 0.07957747154594767;

      float rayleighPhase( float cosTheta ) {
        return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) );
      }

      float hgPhase( float cosTheta, float g ) {
        float g2 = pow( g, 2.0 );
        float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 );
        return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse );
      }

      void main() {

        vec3 direction = normalize( vWorldPosition - cameraPos );

      // optical length
      // cutoff angle at 90 to avoid singularity in next formula.
        float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
        float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
        float sR = rayleighZenithLength * inverse;
        float sM = mieZenithLength * inverse;

      // combined extinction factor
        vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );

      // in scattering
        float cosTheta = dot( direction, vSunDirection );

        float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
        vec3 betaRTheta = vBetaR * rPhase;

        float mPhase = hgPhase( cosTheta, mieDirectionalG );
        vec3 betaMTheta = vBetaM * mPhase;

        vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
        Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );

      // nightsky
        float theta = acos( direction.y ); // elevation --> y-axis, [-pi/2, pi/2]
        float phi = atan( direction.z, direction.x ); // azimuth --> x-axis [-pi/2, pi/2]
        vec2 uv = vec2( phi, theta ) / vec2( 2.0 * pi, pi ) + vec2( 0.5, 0.0 );
        vec3 L0 = vec3( 0.1 ) * Fex;

      // composition + solar disc
        float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
        L0 += ( vSunE * 19000.0 * Fex ) * sundisk;

        vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );

        vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );

        gl_FragColor = vec4( retColor, 1.0 );

      #include <tonemapping_fragment>
      #include <${kn >= 154 ? "colorspace_fragment" : "encodings_fragment"}>

      }
    `
    )
  }, r = new Ht({
    name: "SkyShader",
    fragmentShader: o.fragmentShader,
    vertexShader: o.vertexShader,
    uniforms: Aa.clone(o.uniforms),
    side: Ca,
    depthWrite: !1
  });
  class u extends Xr {
    constructor() {
      super(new Fo(1, 1, 1), r);
    }
  }
  return ia(u, "SkyShader", o), ia(u, "material", r), u;
})(), Vi = (o) => o && o.isCubeTexture;
class ji extends Xr {
  constructor(r, u) {
    var c, t;
    const e = Vi(r), s = ((t = e ? (c = r.image[0]) == null ? void 0 : c.width : r.image.width) != null ? t : 1024) / 4, a = Math.floor(Math.log2(s)), i = Math.pow(2, a), l = 3 * Math.max(i, 112), h = 4 * i, d = [
      e ? "#define ENVMAP_TYPE_CUBE" : "",
      `#define CUBEUV_TEXEL_WIDTH ${1 / l}`,
      `#define CUBEUV_TEXEL_HEIGHT ${1 / h}`,
      `#define CUBEUV_MAX_MIP ${a}.0`
    ], p = (
      /* glsl */
      `
        varying vec3 vWorldPosition;
        void main() 
        {
            vec4 worldPosition = ( modelMatrix * vec4( position, 1.0 ) );
            vWorldPosition = worldPosition.xyz;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
        `
    ), g = d.join(`
`) + /* glsl */
    `
        #define ENVMAP_TYPE_CUBE_UV
        varying vec3 vWorldPosition;
        uniform float radius;
        uniform float height;
        uniform float angle;
        #ifdef ENVMAP_TYPE_CUBE
            uniform samplerCube map;
        #else
            uniform sampler2D map;
        #endif
        // From: https://www.shadertoy.com/view/4tsBD7
        float diskIntersectWithBackFaceCulling( vec3 ro, vec3 rd, vec3 c, vec3 n, float r ) 
        {
            float d = dot ( rd, n );
            
            if( d > 0.0 ) { return 1e6; }
            
            vec3  o = ro - c;
            float t = - dot( n, o ) / d;
            vec3  q = o + rd * t;
            
            return ( dot( q, q ) < r * r ) ? t : 1e6;
        }
        // From: https://www.iquilezles.org/www/articles/intersectors/intersectors.htm
        float sphereIntersect( vec3 ro, vec3 rd, vec3 ce, float ra ) 
        {
            vec3 oc = ro - ce;
            float b = dot( oc, rd );
            float c = dot( oc, oc ) - ra * ra;
            float h = b * b - c;
            
            if( h < 0.0 ) { return -1.0; }
            
            h = sqrt( h );
            
            return - b + h;
        }
        vec3 project() 
        {
            vec3 p = normalize( vWorldPosition );
            vec3 camPos = cameraPosition;
            camPos.y -= height;
            float intersection = sphereIntersect( camPos, p, vec3( 0.0 ), radius );
            if( intersection > 0.0 ) {
                
                vec3 h = vec3( 0.0, - height, 0.0 );
                float intersection2 = diskIntersectWithBackFaceCulling( camPos, p, h, vec3( 0.0, 1.0, 0.0 ), radius );
                p = ( camPos + min( intersection, intersection2 ) * p ) / radius;
            } else {
                p = vec3( 0.0, 1.0, 0.0 );
            }
            return p;
        }
        #include <common>
        #include <cube_uv_reflection_fragment>
        void main() 
        {
            vec3 projectedWorldPosition = project();
            
            #ifdef ENVMAP_TYPE_CUBE
                vec3 outcolor = textureCube( map, projectedWorldPosition ).rgb;
            #else
                vec3 direction = normalize( projectedWorldPosition );
                vec2 uv = equirectUv( direction );
                vec3 outcolor = texture2D( map, uv ).rgb;
            #endif
            gl_FragColor = vec4( outcolor, 1.0 );
            #include <tonemapping_fragment>
            #include <${kn >= 154 ? "colorspace_fragment" : "encodings_fragment"}>
        }
        `, S = {
      map: { value: r },
      height: { value: u?.height || 15 },
      radius: { value: u?.radius || 100 }
    }, w = new ko(1, 16), I = new Ht({
      uniforms: S,
      fragmentShader: g,
      vertexShader: p,
      side: Vt
    });
    super(w, I);
  }
  set radius(r) {
    this.material.uniforms.radius.value = r;
  }
  get radius() {
    return this.material.uniforms.radius.value;
  }
  set height(r) {
    this.material.uniforms.height.value = r;
  }
  get height() {
    return this.material.uniforms.height.value;
  }
}
class Xi extends Fa {
  constructor(r) {
    super(r), this.type = Fr;
  }
  // adapted from http://www.graphics.cornell.edu/~bjw/rgbe.html
  parse(r) {
    const n = function(y, M) {
      switch (y) {
        case 1:
          throw new Error("THREE.RGBELoader: Read Error: " + (M || ""));
        case 2:
          throw new Error("THREE.RGBELoader: Write Error: " + (M || ""));
        case 3:
          throw new Error("THREE.RGBELoader: Bad File Format: " + (M || ""));
        default:
        case 4:
          throw new Error("THREE.RGBELoader: Memory Error: " + (M || ""));
      }
    }, h = function(y, M, L) {
      M = M || 1024;
      let x = y.pos, R = -1, b = 0, K = "", H = String.fromCharCode.apply(null, new Uint16Array(y.subarray(x, x + 128)));
      for (; 0 > (R = H.indexOf(`
`)) && b < M && x < y.byteLength; )
        K += H, b += H.length, x += 128, H += String.fromCharCode.apply(null, new Uint16Array(y.subarray(x, x + 128)));
      return -1 < R ? (y.pos += b + R + 1, K + H.slice(0, R)) : !1;
    }, d = function(y) {
      const M = /^#\?(\S+)/, L = /^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/, ee = /^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/, x = /^\s*FORMAT=(\S+)\s*$/, R = /^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/, b = {
        valid: 0,
        string: "",
        comments: "",
        programtype: "RGBE",
        format: "",
        gamma: 1,
        exposure: 1,
        width: 0,
        height: 0
      };
      let K, H;
      for ((y.pos >= y.byteLength || !(K = h(y))) && n(1, "no header found"), (H = K.match(M)) || n(3, "bad initial token"), b.valid |= 1, b.programtype = H[1], b.string += K + `
`; K = h(y), K !== !1; ) {
        if (b.string += K + `
`, K.charAt(0) === "#") {
          b.comments += K + `
`;
          continue;
        }
        if ((H = K.match(L)) && (b.gamma = parseFloat(H[1])), (H = K.match(ee)) && (b.exposure = parseFloat(H[1])), (H = K.match(x)) && (b.valid |= 2, b.format = H[1]), (H = K.match(R)) && (b.valid |= 4, b.height = parseInt(H[1], 10), b.width = parseInt(H[2], 10)), b.valid & 2 && b.valid & 4)
          break;
      }
      return b.valid & 2 || n(3, "missing format specifier"), b.valid & 4 || n(3, "missing image size specifier"), b;
    }, p = function(y, M, L) {
      const ee = M;
      if (
        // run length encoding is not allowed so read flat
        ee < 8 || ee > 32767 || // this file is not run length encoded
        y[0] !== 2 || y[1] !== 2 || y[2] & 128
      )
        return new Uint8Array(y);
      ee !== (y[2] << 8 | y[3]) && n(3, "wrong scanline width");
      const x = new Uint8Array(4 * M * L);
      x.length || n(4, "unable to allocate buffer space");
      let R = 0, b = 0;
      const K = 4 * ee, H = new Uint8Array(4), se = new Uint8Array(K);
      let he = L;
      for (; he > 0 && b < y.byteLength; ) {
        b + 4 > y.byteLength && n(1), H[0] = y[b++], H[1] = y[b++], H[2] = y[b++], H[3] = y[b++], (H[0] != 2 || H[1] != 2 || (H[2] << 8 | H[3]) != ee) && n(3, "bad rgbe scanline format");
        let Z = 0, G;
        for (; Z < K && b < y.byteLength; ) {
          G = y[b++];
          const E = G > 128;
          if (E && (G -= 128), (G === 0 || Z + G > K) && n(3, "bad scanline data"), E) {
            const D = y[b++];
            for (let N = 0; N < G; N++)
              se[Z++] = D;
          } else
            se.set(y.subarray(b, b + G), Z), Z += G, b += G;
        }
        const _ = ee;
        for (let E = 0; E < _; E++) {
          let D = 0;
          x[R] = se[E + D], D += ee, x[R + 1] = se[E + D], D += ee, x[R + 2] = se[E + D], D += ee, x[R + 3] = se[E + D], R += 4;
        }
        he--;
      }
      return x;
    }, g = function(y, M, L, ee) {
      const x = y[M + 3], R = Math.pow(2, x - 128) / 255;
      L[ee + 0] = y[M + 0] * R, L[ee + 1] = y[M + 1] * R, L[ee + 2] = y[M + 2] * R, L[ee + 3] = 1;
    }, S = function(y, M, L, ee) {
      const x = y[M + 3], R = Math.pow(2, x - 128) / 255;
      L[ee + 0] = et.toHalfFloat(Math.min(y[M + 0] * R, 65504)), L[ee + 1] = et.toHalfFloat(Math.min(y[M + 1] * R, 65504)), L[ee + 2] = et.toHalfFloat(Math.min(y[M + 2] * R, 65504)), L[ee + 3] = et.toHalfFloat(1);
    }, w = new Uint8Array(r);
    w.pos = 0;
    const I = d(w), A = I.width, k = I.height, T = p(w.subarray(w.pos), A, k);
    let U, O, C;
    switch (this.type) {
      case zr:
        C = T.length / 4;
        const y = new Float32Array(C * 4);
        for (let L = 0; L < C; L++)
          g(T, L * 4, y, L * 4);
        U = y, O = zr;
        break;
      case Fr:
        C = T.length / 4;
        const M = new Uint16Array(C * 4);
        for (let L = 0; L < C; L++)
          S(T, L * 4, M, L * 4);
        U = M, O = Fr;
        break;
      default:
        throw new Error("THREE.RGBELoader: Unsupported type: " + this.type);
    }
    return {
      width: A,
      height: k,
      data: U,
      header: I.string,
      gamma: I.gamma,
      exposure: I.exposure,
      type: O
    };
  }
  setDataType(r) {
    return this.type = r, this;
  }
  load(r, u, c, t) {
    function e(n, s) {
      switch (n.type) {
        case zr:
        case Fr:
          "colorSpace" in n ? n.colorSpace = "srgb-linear" : n.encoding = 3e3, n.minFilter = Ur, n.magFilter = Ur, n.generateMipmaps = !1, n.flipY = !0;
          break;
      }
      u && u(n, s);
    }
    return super.load(r, e, c, t);
  }
}
const ft = kn >= 152;
class Zi extends Fa {
  constructor(r) {
    super(r), this.type = Fr;
  }
  parse(r) {
    const M = Math.pow(2.7182818, 2.2);
    function L(f, v) {
      for (var m = 0, F = 0; F < 65536; ++F)
        (F == 0 || f[F >> 3] & 1 << (F & 7)) && (v[m++] = F);
      for (var z = m - 1; m < 65536; )
        v[m++] = 0;
      return z;
    }
    function ee(f) {
      for (var v = 0; v < 16384; v++)
        f[v] = {}, f[v].len = 0, f[v].lit = 0, f[v].p = null;
    }
    const x = { l: 0, c: 0, lc: 0 };
    function R(f, v, m, F, z) {
      for (; m < f; )
        v = v << 8 | be(F, z), m += 8;
      m -= f, x.l = v >> m & (1 << f) - 1, x.c = v, x.lc = m;
    }
    const b = new Array(59);
    function K(f) {
      for (var v = 0; v <= 58; ++v)
        b[v] = 0;
      for (var v = 0; v < 65537; ++v)
        b[f[v]] += 1;
      for (var m = 0, v = 58; v > 0; --v) {
        var F = m + b[v] >> 1;
        b[v] = m, m = F;
      }
      for (var v = 0; v < 65537; ++v) {
        var z = f[v];
        z > 0 && (f[v] = z | b[z]++ << 6);
      }
    }
    function H(f, v, m, F, z, W, re) {
      for (var Q = m, ne = 0, ae = 0; z <= W; z++) {
        if (Q.value - m.value > F)
          return !1;
        R(6, ne, ae, f, Q);
        var ie = x.l;
        if (ne = x.c, ae = x.lc, re[z] = ie, ie == 63) {
          if (Q.value - m.value > F)
            throw "Something wrong with hufUnpackEncTable";
          R(8, ne, ae, f, Q);
          var P = x.l + 6;
          if (ne = x.c, ae = x.lc, z + P > W + 1)
            throw "Something wrong with hufUnpackEncTable";
          for (; P--; )
            re[z++] = 0;
          z--;
        } else if (ie >= 59) {
          var P = ie - 59 + 2;
          if (z + P > W + 1)
            throw "Something wrong with hufUnpackEncTable";
          for (; P--; )
            re[z++] = 0;
          z--;
        }
      }
      K(re);
    }
    function se(f) {
      return f & 63;
    }
    function he(f) {
      return f >> 6;
    }
    function Z(f, v, m, F) {
      for (; v <= m; v++) {
        var z = he(f[v]), W = se(f[v]);
        if (z >> W)
          throw "Invalid table entry";
        if (W > 14) {
          var re = F[z >> W - 14];
          if (re.len)
            throw "Invalid table entry";
          if (re.lit++, re.p) {
            var Q = re.p;
            re.p = new Array(re.lit);
            for (var ne = 0; ne < re.lit - 1; ++ne)
              re.p[ne] = Q[ne];
          } else
            re.p = new Array(1);
          re.p[re.lit - 1] = v;
        } else if (W)
          for (var ae = 0, ne = 1 << 14 - W; ne > 0; ne--) {
            var re = F[(z << 14 - W) + ae];
            if (re.len || re.p)
              throw "Invalid table entry";
            re.len = W, re.lit = v, ae++;
          }
      }
      return !0;
    }
    const G = { c: 0, lc: 0 };
    function _(f, v, m, F) {
      f = f << 8 | be(m, F), v += 8, G.c = f, G.lc = v;
    }
    const E = { c: 0, lc: 0 };
    function D(f, v, m, F, z, W, re, Q, ne, ae) {
      if (f == v) {
        F < 8 && (_(m, F, z, re), m = G.c, F = G.lc), F -= 8;
        var ie = m >> F, ie = new Uint8Array([ie])[0];
        if (ne.value + ie > ae)
          return !1;
        for (var P = Q[ne.value - 1]; ie-- > 0; )
          Q[ne.value++] = P;
      } else if (ne.value < ae)
        Q[ne.value++] = f;
      else
        return !1;
      E.c = m, E.lc = F;
    }
    function N(f) {
      return f & 65535;
    }
    function B(f) {
      var v = N(f);
      return v > 32767 ? v - 65536 : v;
    }
    const V = { a: 0, b: 0 };
    function j(f, v) {
      var m = B(f), F = B(v), z = F, W = m + (z & 1) + (z >> 1), re = W, Q = W - z;
      V.a = re, V.b = Q;
    }
    function Y(f, v) {
      var m = N(f), F = N(v), z = m - (F >> 1) & 65535, W = F + z - 32768 & 65535;
      V.a = W, V.b = z;
    }
    function ue(f, v, m, F, z, W, re) {
      for (var Q = re < 16384, ne = m > z ? z : m, ae = 1, ie; ae <= ne; )
        ae <<= 1;
      for (ae >>= 1, ie = ae, ae >>= 1; ae >= 1; ) {
        for (var P = 0, Ke = P + W * (z - ie), we = W * ae, pe = W * ie, Ue = F * ae, Oe = F * ie, He, Ve, or, vr; P <= Ke; P += pe) {
          for (var je = P, Mr = P + F * (m - ie); je <= Mr; je += Oe) {
            var qe = je + Ue, lr = je + we, mr = lr + Ue;
            Q ? (j(f[je + v], f[lr + v]), He = V.a, or = V.b, j(f[qe + v], f[mr + v]), Ve = V.a, vr = V.b, j(He, Ve), f[je + v] = V.a, f[qe + v] = V.b, j(or, vr), f[lr + v] = V.a, f[mr + v] = V.b) : (Y(f[je + v], f[lr + v]), He = V.a, or = V.b, Y(f[qe + v], f[mr + v]), Ve = V.a, vr = V.b, Y(He, Ve), f[je + v] = V.a, f[qe + v] = V.b, Y(or, vr), f[lr + v] = V.a, f[mr + v] = V.b);
          }
          if (m & ae) {
            var lr = je + we;
            Q ? j(f[je + v], f[lr + v]) : Y(f[je + v], f[lr + v]), He = V.a, f[lr + v] = V.b, f[je + v] = He;
          }
        }
        if (z & ae)
          for (var je = P, Mr = P + F * (m - ie); je <= Mr; je += Oe) {
            var qe = je + Ue;
            Q ? j(f[je + v], f[qe + v]) : Y(f[je + v], f[qe + v]), He = V.a, f[qe + v] = V.b, f[je + v] = He;
          }
        ie = ae, ae >>= 1;
      }
      return P;
    }
    function ve(f, v, m, F, z, W, re, Q, ne, ae) {
      for (var ie = 0, P = 0, Ke = Q, we = Math.trunc(z.value + (W + 7) / 8); z.value < we; )
        for (_(ie, P, m, z), ie = G.c, P = G.lc; P >= 14; ) {
          var pe = ie >> P - 14 & 16383, Ue = v[pe];
          if (Ue.len)
            P -= Ue.len, D(Ue.lit, re, ie, P, m, F, z, ne, ae, Ke), ie = E.c, P = E.lc;
          else {
            if (!Ue.p)
              throw "hufDecode issues";
            var Oe;
            for (Oe = 0; Oe < Ue.lit; Oe++) {
              for (var He = se(f[Ue.p[Oe]]); P < He && z.value < we; )
                _(ie, P, m, z), ie = G.c, P = G.lc;
              if (P >= He && he(f[Ue.p[Oe]]) == (ie >> P - He & (1 << He) - 1)) {
                P -= He, D(
                  Ue.p[Oe],
                  re,
                  ie,
                  P,
                  m,
                  F,
                  z,
                  ne,
                  ae,
                  Ke
                ), ie = E.c, P = E.lc;
                break;
              }
            }
            if (Oe == Ue.lit)
              throw "hufDecode issues";
          }
        }
      var Ve = 8 - W & 7;
      for (ie >>= Ve, P -= Ve; P > 0; ) {
        var Ue = v[ie << 14 - P & 16383];
        if (Ue.len)
          P -= Ue.len, D(Ue.lit, re, ie, P, m, F, z, ne, ae, Ke), ie = E.c, P = E.lc;
        else
          throw "hufDecode issues";
      }
      return !0;
    }
    function oe(f, v, m, F, z, W) {
      var re = { value: 0 }, Q = m.value, ne = Me(v, m), ae = Me(v, m);
      m.value += 4;
      var ie = Me(v, m);
      if (m.value += 4, ne < 0 || ne >= 65537 || ae < 0 || ae >= 65537)
        throw "Something wrong with HUF_ENCSIZE";
      var P = new Array(65537), Ke = new Array(16384);
      ee(Ke);
      var we = F - (m.value - Q);
      if (H(f, v, m, we, ne, ae, P), ie > 8 * (F - (m.value - Q)))
        throw "Something wrong with hufUncompress";
      Z(P, ne, ae, Ke), ve(P, Ke, f, v, m, ie, ae, W, z, re);
    }
    function $(f, v, m) {
      for (var F = 0; F < m; ++F)
        v[F] = f[v[F]];
    }
    function Fe(f) {
      for (var v = 1; v < f.length; v++) {
        var m = f[v - 1] + f[v] - 128;
        f[v] = m;
      }
    }
    function Te(f, v) {
      for (var m = 0, F = Math.floor((f.length + 1) / 2), z = 0, W = f.length - 1; !(z > W || (v[z++] = f[m++], z > W)); )
        v[z++] = f[F++];
    }
    function fe(f) {
      for (var v = f.byteLength, m = new Array(), F = 0, z = new DataView(f); v > 0; ) {
        var W = z.getInt8(F++);
        if (W < 0) {
          var re = -W;
          v -= re + 1;
          for (var Q = 0; Q < re; Q++)
            m.push(z.getUint8(F++));
        } else {
          var re = W;
          v -= 2;
          for (var ne = z.getUint8(F++), Q = 0; Q < re + 1; Q++)
            m.push(ne);
        }
      }
      return m;
    }
    function ge(f, v, m, F, z, W) {
      var qe = new DataView(W.buffer), re = m[f.idx[0]].width, Q = m[f.idx[0]].height, ne = 3, ae = Math.floor(re / 8), ie = Math.ceil(re / 8), P = Math.ceil(Q / 8), Ke = re - (ie - 1) * 8, we = Q - (P - 1) * 8, pe = { value: 0 }, Ue = new Array(ne), Oe = new Array(ne), He = new Array(ne), Ve = new Array(ne), or = new Array(ne);
      for (let Xe = 0; Xe < ne; ++Xe)
        or[Xe] = v[f.idx[Xe]], Ue[Xe] = Xe < 1 ? 0 : Ue[Xe - 1] + ie * P, Oe[Xe] = new Float32Array(64), He[Xe] = new Uint16Array(64), Ve[Xe] = new Uint16Array(ie * 64);
      for (let Xe = 0; Xe < P; ++Xe) {
        var vr = 8;
        Xe == P - 1 && (vr = we);
        var je = 8;
        for (let $e = 0; $e < ie; ++$e) {
          $e == ie - 1 && (je = Ke);
          for (let Le = 0; Le < ne; ++Le)
            He[Le].fill(0), He[Le][0] = z[Ue[Le]++], Ee(pe, F, He[Le]), te(He[Le], Oe[Le]), me(Oe[Le]);
          de(Oe);
          for (let Le = 0; Le < ne; ++Le)
            q(Oe[Le], Ve[Le], $e * 64);
        }
        let ur = 0;
        for (let $e = 0; $e < ne; ++$e) {
          const Le = m[f.idx[$e]].type;
          for (let _r = 8 * Xe; _r < 8 * Xe + vr; ++_r) {
            ur = or[$e][_r];
            for (let Cr = 0; Cr < ae; ++Cr) {
              const fr = Cr * 64 + (_r & 7) * 8;
              qe.setUint16(ur + 0 * Le, Ve[$e][fr + 0], !0), qe.setUint16(ur + 2 * Le, Ve[$e][fr + 1], !0), qe.setUint16(ur + 4 * Le, Ve[$e][fr + 2], !0), qe.setUint16(ur + 6 * Le, Ve[$e][fr + 3], !0), qe.setUint16(ur + 8 * Le, Ve[$e][fr + 4], !0), qe.setUint16(ur + 10 * Le, Ve[$e][fr + 5], !0), qe.setUint16(ur + 12 * Le, Ve[$e][fr + 6], !0), qe.setUint16(ur + 14 * Le, Ve[$e][fr + 7], !0), ur += 16 * Le;
            }
          }
          if (ae != ie)
            for (let _r = 8 * Xe; _r < 8 * Xe + vr; ++_r) {
              const Cr = or[$e][_r] + 8 * ae * 2 * Le, fr = ae * 64 + (_r & 7) * 8;
              for (let Rr = 0; Rr < je; ++Rr)
                qe.setUint16(Cr + Rr * 2 * Le, Ve[$e][fr + Rr], !0);
            }
        }
      }
      for (var Mr = new Uint16Array(re), qe = new DataView(W.buffer), lr = 0; lr < ne; ++lr) {
        m[f.idx[lr]].decoded = !0;
        var mr = m[f.idx[lr]].type;
        if (m[lr].type == 2)
          for (var Gr = 0; Gr < Q; ++Gr) {
            const Xe = or[lr][Gr];
            for (var cr = 0; cr < re; ++cr)
              Mr[cr] = qe.getUint16(Xe + cr * 2 * mr, !0);
            for (var cr = 0; cr < re; ++cr)
              qe.setFloat32(Xe + cr * 2 * mr, X(Mr[cr]), !0);
          }
      }
    }
    function Ee(f, v, m) {
      for (var F, z = 1; z < 64; )
        F = v[f.value], F == 65280 ? z = 64 : F >> 8 == 255 ? z += F & 255 : (m[z] = F, z++), f.value++;
    }
    function te(f, v) {
      v[0] = X(f[0]), v[1] = X(f[1]), v[2] = X(f[5]), v[3] = X(f[6]), v[4] = X(f[14]), v[5] = X(f[15]), v[6] = X(f[27]), v[7] = X(f[28]), v[8] = X(f[2]), v[9] = X(f[4]), v[10] = X(f[7]), v[11] = X(f[13]), v[12] = X(f[16]), v[13] = X(f[26]), v[14] = X(f[29]), v[15] = X(f[42]), v[16] = X(f[3]), v[17] = X(f[8]), v[18] = X(f[12]), v[19] = X(f[17]), v[20] = X(f[25]), v[21] = X(f[30]), v[22] = X(f[41]), v[23] = X(f[43]), v[24] = X(f[9]), v[25] = X(f[11]), v[26] = X(f[18]), v[27] = X(f[24]), v[28] = X(f[31]), v[29] = X(f[40]), v[30] = X(f[44]), v[31] = X(f[53]), v[32] = X(f[10]), v[33] = X(f[19]), v[34] = X(f[23]), v[35] = X(f[32]), v[36] = X(f[39]), v[37] = X(f[45]), v[38] = X(f[52]), v[39] = X(f[54]), v[40] = X(f[20]), v[41] = X(f[22]), v[42] = X(f[33]), v[43] = X(f[38]), v[44] = X(f[46]), v[45] = X(f[51]), v[46] = X(f[55]), v[47] = X(f[60]), v[48] = X(f[21]), v[49] = X(f[34]), v[50] = X(f[37]), v[51] = X(f[47]), v[52] = X(f[50]), v[53] = X(f[56]), v[54] = X(f[59]), v[55] = X(f[61]), v[56] = X(f[35]), v[57] = X(f[36]), v[58] = X(f[48]), v[59] = X(f[49]), v[60] = X(f[57]), v[61] = X(f[58]), v[62] = X(f[62]), v[63] = X(f[63]);
    }
    function me(f) {
      const v = 0.5 * Math.cos(0.7853975), m = 0.5 * Math.cos(3.14159 / 16), F = 0.5 * Math.cos(3.14159 / 8), z = 0.5 * Math.cos(3 * 3.14159 / 16), W = 0.5 * Math.cos(5 * 3.14159 / 16), re = 0.5 * Math.cos(3 * 3.14159 / 8), Q = 0.5 * Math.cos(7 * 3.14159 / 16);
      for (var ne = new Array(4), ae = new Array(4), ie = new Array(4), P = new Array(4), Ke = 0; Ke < 8; ++Ke) {
        var we = Ke * 8;
        ne[0] = F * f[we + 2], ne[1] = re * f[we + 2], ne[2] = F * f[we + 6], ne[3] = re * f[we + 6], ae[0] = m * f[we + 1] + z * f[we + 3] + W * f[we + 5] + Q * f[we + 7], ae[1] = z * f[we + 1] - Q * f[we + 3] - m * f[we + 5] - W * f[we + 7], ae[2] = W * f[we + 1] - m * f[we + 3] + Q * f[we + 5] + z * f[we + 7], ae[3] = Q * f[we + 1] - W * f[we + 3] + z * f[we + 5] - m * f[we + 7], ie[0] = v * (f[we + 0] + f[we + 4]), ie[3] = v * (f[we + 0] - f[we + 4]), ie[1] = ne[0] + ne[3], ie[2] = ne[1] - ne[2], P[0] = ie[0] + ie[1], P[1] = ie[3] + ie[2], P[2] = ie[3] - ie[2], P[3] = ie[0] - ie[1], f[we + 0] = P[0] + ae[0], f[we + 1] = P[1] + ae[1], f[we + 2] = P[2] + ae[2], f[we + 3] = P[3] + ae[3], f[we + 4] = P[3] - ae[3], f[we + 5] = P[2] - ae[2], f[we + 6] = P[1] - ae[1], f[we + 7] = P[0] - ae[0];
      }
      for (var pe = 0; pe < 8; ++pe)
        ne[0] = F * f[16 + pe], ne[1] = re * f[16 + pe], ne[2] = F * f[48 + pe], ne[3] = re * f[48 + pe], ae[0] = m * f[8 + pe] + z * f[24 + pe] + W * f[40 + pe] + Q * f[56 + pe], ae[1] = z * f[8 + pe] - Q * f[24 + pe] - m * f[40 + pe] - W * f[56 + pe], ae[2] = W * f[8 + pe] - m * f[24 + pe] + Q * f[40 + pe] + z * f[56 + pe], ae[3] = Q * f[8 + pe] - W * f[24 + pe] + z * f[40 + pe] - m * f[56 + pe], ie[0] = v * (f[pe] + f[32 + pe]), ie[3] = v * (f[pe] - f[32 + pe]), ie[1] = ne[0] + ne[3], ie[2] = ne[1] - ne[2], P[0] = ie[0] + ie[1], P[1] = ie[3] + ie[2], P[2] = ie[3] - ie[2], P[3] = ie[0] - ie[1], f[0 + pe] = P[0] + ae[0], f[8 + pe] = P[1] + ae[1], f[16 + pe] = P[2] + ae[2], f[24 + pe] = P[3] + ae[3], f[32 + pe] = P[3] - ae[3], f[40 + pe] = P[2] - ae[2], f[48 + pe] = P[1] - ae[1], f[56 + pe] = P[0] - ae[0];
    }
    function de(f) {
      for (var v = 0; v < 64; ++v) {
        var m = f[0][v], F = f[1][v], z = f[2][v];
        f[0][v] = m + 1.5747 * z, f[1][v] = m - 0.1873 * F - 0.4682 * z, f[2][v] = m + 1.8556 * F;
      }
    }
    function q(f, v, m) {
      for (var F = 0; F < 64; ++F)
        v[m + F] = et.toHalfFloat(Ae(f[F]));
    }
    function Ae(f) {
      return f <= 1 ? Math.sign(f) * Math.pow(Math.abs(f), 2.2) : Math.sign(f) * Math.pow(M, Math.abs(f) - 1);
    }
    function ce(f) {
      return new DataView(f.array.buffer, f.offset.value, f.size);
    }
    function xe(f) {
      var v = f.viewer.buffer.slice(f.offset.value, f.offset.value + f.size), m = new Uint8Array(fe(v)), F = new Uint8Array(m.length);
      return Fe(m), Te(m, F), new DataView(F.buffer);
    }
    function le(f) {
      var v = f.array.slice(f.offset.value, f.offset.value + f.size), m = Rt(v), F = new Uint8Array(m.length);
      return Fe(m), Te(m, F), new DataView(F.buffer);
    }
    function ze(f) {
      for (var v = f.viewer, m = { value: f.offset.value }, F = new Uint16Array(f.width * f.scanlineBlockSize * (f.channels * f.type)), z = new Uint8Array(8192), W = 0, re = new Array(f.channels), Q = 0; Q < f.channels; Q++)
        re[Q] = {}, re[Q].start = W, re[Q].end = re[Q].start, re[Q].nx = f.width, re[Q].ny = f.lines, re[Q].size = f.type, W += re[Q].nx * re[Q].ny * re[Q].size;
      var ne = Ne(v, m), ae = Ne(v, m);
      if (ae >= 8192)
        throw "Something is wrong with PIZ_COMPRESSION BITMAP_SIZE";
      if (ne <= ae)
        for (var Q = 0; Q < ae - ne + 1; Q++)
          z[Q + ne] = Ye(v, m);
      var ie = new Uint16Array(65536), P = L(z, ie), Ke = Me(v, m);
      oe(f.array, v, m, Ke, F, W);
      for (var Q = 0; Q < f.channels; ++Q)
        for (var we = re[Q], pe = 0; pe < re[Q].size; ++pe)
          ue(F, we.start + pe, we.nx, we.size, we.ny, we.nx * we.size, P);
      $(ie, F, W);
      for (var Ue = 0, Oe = new Uint8Array(F.buffer.byteLength), He = 0; He < f.lines; He++)
        for (var Ve = 0; Ve < f.channels; Ve++) {
          var we = re[Ve], or = we.nx * we.size, vr = new Uint8Array(F.buffer, we.end * 2, or * 2);
          Oe.set(vr, Ue), Ue += or * 2, we.end += or;
        }
      return new DataView(Oe.buffer);
    }
    function ye(f) {
      var v = f.array.slice(f.offset.value, f.offset.value + f.size), m = Rt(v);
      const F = f.lines * f.channels * f.width, z = f.type == 1 ? new Uint16Array(F) : new Uint32Array(F);
      let W = 0, re = 0;
      const Q = new Array(4);
      for (let ne = 0; ne < f.lines; ne++)
        for (let ae = 0; ae < f.channels; ae++) {
          let ie = 0;
          switch (f.type) {
            case 1:
              Q[0] = W, Q[1] = Q[0] + f.width, W = Q[1] + f.width;
              for (let P = 0; P < f.width; ++P) {
                const Ke = m[Q[0]++] << 8 | m[Q[1]++];
                ie += Ke, z[re] = ie, re++;
              }
              break;
            case 2:
              Q[0] = W, Q[1] = Q[0] + f.width, Q[2] = Q[1] + f.width, W = Q[2] + f.width;
              for (let P = 0; P < f.width; ++P) {
                const Ke = m[Q[0]++] << 24 | m[Q[1]++] << 16 | m[Q[2]++] << 8;
                ie += Ke, z[re] = ie, re++;
              }
              break;
          }
        }
      return new DataView(z.buffer);
    }
    function _e(f) {
      var v = f.viewer, m = { value: f.offset.value }, F = new Uint8Array(f.width * f.lines * (f.channels * f.type * 2)), z = {
        version: Ge(v, m),
        unknownUncompressedSize: Ge(v, m),
        unknownCompressedSize: Ge(v, m),
        acCompressedSize: Ge(v, m),
        dcCompressedSize: Ge(v, m),
        rleCompressedSize: Ge(v, m),
        rleUncompressedSize: Ge(v, m),
        rleRawSize: Ge(v, m),
        totalAcUncompressedCount: Ge(v, m),
        totalDcUncompressedCount: Ge(v, m),
        acCompression: Ge(v, m)
      };
      if (z.version < 2)
        throw "EXRLoader.parse: " + Er.compression + " version " + z.version + " is unsupported";
      for (var W = new Array(), re = Ne(v, m) - 2; re > 0; ) {
        var Q = Se(v.buffer, m), ne = Ye(v, m), ae = ne >> 2 & 3, ie = (ne >> 4) - 1, P = new Int8Array([ie])[0], Ke = Ye(v, m);
        W.push({
          name: Q,
          index: P,
          type: Ke,
          compression: ae
        }), re -= Q.length + 3;
      }
      for (var we = Er.channels, pe = new Array(f.channels), Ue = 0; Ue < f.channels; ++Ue) {
        var Oe = pe[Ue] = {}, He = we[Ue];
        Oe.name = He.name, Oe.compression = 0, Oe.decoded = !1, Oe.type = He.pixelType, Oe.pLinear = He.pLinear, Oe.width = f.width, Oe.height = f.lines;
      }
      for (var Ve = {
        idx: new Array(3)
      }, or = 0; or < f.channels; ++or)
        for (var Oe = pe[or], Ue = 0; Ue < W.length; ++Ue) {
          var vr = W[Ue];
          Oe.name == vr.name && (Oe.compression = vr.compression, vr.index >= 0 && (Ve.idx[vr.index] = or), Oe.offset = or);
        }
      if (z.acCompressedSize > 0)
        switch (z.acCompression) {
          case 0:
            var qe = new Uint16Array(z.totalAcUncompressedCount);
            oe(
              f.array,
              v,
              m,
              z.acCompressedSize,
              qe,
              z.totalAcUncompressedCount
            );
            break;
          case 1:
            var je = f.array.slice(m.value, m.value + z.totalAcUncompressedCount), Mr = Rt(je), qe = new Uint16Array(Mr.buffer);
            m.value += z.totalAcUncompressedCount;
            break;
        }
      if (z.dcCompressedSize > 0) {
        var lr = {
          array: f.array,
          offset: m,
          size: z.dcCompressedSize
        }, mr = new Uint16Array(le(lr).buffer);
        m.value += z.dcCompressedSize;
      }
      if (z.rleRawSize > 0) {
        var je = f.array.slice(m.value, m.value + z.rleCompressedSize), Mr = Rt(je), Gr = fe(Mr.buffer);
        m.value += z.rleCompressedSize;
      }
      for (var cr = 0, Xe = new Array(pe.length), Ue = 0; Ue < Xe.length; ++Ue)
        Xe[Ue] = new Array();
      for (var ur = 0; ur < f.lines; ++ur)
        for (var $e = 0; $e < pe.length; ++$e)
          Xe[$e].push(cr), cr += pe[$e].width * f.type * 2;
      ge(Ve, Xe, pe, qe, mr, F);
      for (var Ue = 0; Ue < pe.length; ++Ue) {
        var Oe = pe[Ue];
        if (!Oe.decoded)
          switch (Oe.compression) {
            case 2:
              for (var Le = 0, _r = 0, ur = 0; ur < f.lines; ++ur) {
                for (var Cr = Xe[Ue][Le], fr = 0; fr < Oe.width; ++fr) {
                  for (var Rr = 0; Rr < 2 * Oe.type; ++Rr)
                    F[Cr++] = Gr[_r + Rr * Oe.width * Oe.height];
                  _r++;
                }
                Le++;
              }
              break;
            default:
              throw "EXRLoader.parse: unsupported channel compression";
          }
      }
      return new DataView(F.buffer);
    }
    function Se(f, v) {
      for (var m = new Uint8Array(f), F = 0; m[v.value + F] != 0; )
        F += 1;
      var z = new TextDecoder().decode(m.slice(v.value, v.value + F));
      return v.value = v.value + F + 1, z;
    }
    function ke(f, v, m) {
      var F = new TextDecoder().decode(new Uint8Array(f).slice(v.value, v.value + m));
      return v.value = v.value + m, F;
    }
    function Je(f, v) {
      var m = Re(f, v), F = Me(f, v);
      return [m, F];
    }
    function tr(f, v) {
      var m = Me(f, v), F = Me(f, v);
      return [m, F];
    }
    function Re(f, v) {
      var m = f.getInt32(v.value, !0);
      return v.value = v.value + 4, m;
    }
    function Me(f, v) {
      var m = f.getUint32(v.value, !0);
      return v.value = v.value + 4, m;
    }
    function be(f, v) {
      var m = f[v.value];
      return v.value = v.value + 1, m;
    }
    function Ye(f, v) {
      var m = f.getUint8(v.value);
      return v.value = v.value + 1, m;
    }
    const Ge = function(f, v) {
      let m;
      return "getBigInt64" in DataView.prototype ? m = Number(f.getBigInt64(v.value, !0)) : m = f.getUint32(v.value + 4, !0) + Number(f.getUint32(v.value, !0) << 32), v.value += 8, m;
    };
    function We(f, v) {
      var m = f.getFloat32(v.value, !0);
      return v.value += 4, m;
    }
    function Qe(f, v) {
      return et.toHalfFloat(We(f, v));
    }
    function X(f) {
      var v = (f & 31744) >> 10, m = f & 1023;
      return (f >> 15 ? -1 : 1) * (v ? v === 31 ? m ? NaN : 1 / 0 : Math.pow(2, v - 15) * (1 + m / 1024) : 6103515625e-14 * (m / 1024));
    }
    function Ne(f, v) {
      var m = f.getUint16(v.value, !0);
      return v.value += 2, m;
    }
    function Lr(f, v) {
      return X(Ne(f, v));
    }
    function Ze(f, v, m, F) {
      for (var z = m.value, W = []; m.value < z + F - 1; ) {
        var re = Se(v, m), Q = Re(f, m), ne = Ye(f, m);
        m.value += 3;
        var ae = Re(f, m), ie = Re(f, m);
        W.push({
          name: re,
          pixelType: Q,
          pLinear: ne,
          xSampling: ae,
          ySampling: ie
        });
      }
      return m.value += 1, W;
    }
    function Pe(f, v) {
      var m = We(f, v), F = We(f, v), z = We(f, v), W = We(f, v), re = We(f, v), Q = We(f, v), ne = We(f, v), ae = We(f, v);
      return {
        redX: m,
        redY: F,
        greenX: z,
        greenY: W,
        blueX: re,
        blueY: Q,
        whiteX: ne,
        whiteY: ae
      };
    }
    function ir(f, v) {
      var m = [
        "NO_COMPRESSION",
        "RLE_COMPRESSION",
        "ZIPS_COMPRESSION",
        "ZIP_COMPRESSION",
        "PIZ_COMPRESSION",
        "PXR24_COMPRESSION",
        "B44_COMPRESSION",
        "B44A_COMPRESSION",
        "DWAA_COMPRESSION",
        "DWAB_COMPRESSION"
      ], F = Ye(f, v);
      return m[F];
    }
    function er(f, v) {
      var m = Me(f, v), F = Me(f, v), z = Me(f, v), W = Me(f, v);
      return { xMin: m, yMin: F, xMax: z, yMax: W };
    }
    function De(f, v) {
      var m = ["INCREASING_Y"], F = Ye(f, v);
      return m[F];
    }
    function rr(f, v) {
      var m = We(f, v), F = We(f, v);
      return [m, F];
    }
    function pr(f, v) {
      var m = We(f, v), F = We(f, v), z = We(f, v);
      return [m, F, z];
    }
    function hr(f, v, m, F, z) {
      if (F === "string" || F === "stringvector" || F === "iccProfile")
        return ke(v, m, z);
      if (F === "chlist")
        return Ze(f, v, m, z);
      if (F === "chromaticities")
        return Pe(f, m);
      if (F === "compression")
        return ir(f, m);
      if (F === "box2i")
        return er(f, m);
      if (F === "lineOrder")
        return De(f, m);
      if (F === "float")
        return We(f, m);
      if (F === "v2f")
        return rr(f, m);
      if (F === "v3f")
        return pr(f, m);
      if (F === "int")
        return Re(f, m);
      if (F === "rational")
        return Je(f, m);
      if (F === "timecode")
        return tr(f, m);
      if (F === "preview")
        return m.value += z, "skipped";
      m.value += z;
    }
    function sr(f, v, m) {
      const F = {};
      if (f.getUint32(0, !0) != 20000630)
        throw "THREE.EXRLoader: provided file doesn't appear to be in OpenEXR format.";
      F.version = f.getUint8(4);
      const z = f.getUint8(5);
      F.spec = {
        singleTile: !!(z & 2),
        longName: !!(z & 4),
        deepFormat: !!(z & 8),
        multiPart: !!(z & 16)
      }, m.value = 8;
      for (var W = !0; W; ) {
        var re = Se(v, m);
        if (re == 0)
          W = !1;
        else {
          var Q = Se(v, m), ne = Me(f, m), ae = hr(f, v, m, Q, ne);
          ae === void 0 ? console.warn(`EXRLoader.parse: skipped unknown header attribute type '${Q}'.`) : F[re] = ae;
        }
      }
      if ((z & -5) != 0)
        throw console.error("EXRHeader:", F), "THREE.EXRLoader: provided file is currently unsupported.";
      return F;
    }
    function Sr(f, v, m, F, z) {
      const W = {
        size: 0,
        viewer: v,
        array: m,
        offset: F,
        width: f.dataWindow.xMax - f.dataWindow.xMin + 1,
        height: f.dataWindow.yMax - f.dataWindow.yMin + 1,
        channels: f.channels.length,
        bytesPerLine: null,
        lines: null,
        inputSize: null,
        type: f.channels[0].pixelType,
        uncompress: null,
        getter: null,
        format: null,
        [ft ? "colorSpace" : "encoding"]: null
      };
      switch (f.compression) {
        case "NO_COMPRESSION":
          W.lines = 1, W.uncompress = ce;
          break;
        case "RLE_COMPRESSION":
          W.lines = 1, W.uncompress = xe;
          break;
        case "ZIPS_COMPRESSION":
          W.lines = 1, W.uncompress = le;
          break;
        case "ZIP_COMPRESSION":
          W.lines = 16, W.uncompress = le;
          break;
        case "PIZ_COMPRESSION":
          W.lines = 32, W.uncompress = ze;
          break;
        case "PXR24_COMPRESSION":
          W.lines = 16, W.uncompress = ye;
          break;
        case "DWAA_COMPRESSION":
          W.lines = 32, W.uncompress = _e;
          break;
        case "DWAB_COMPRESSION":
          W.lines = 256, W.uncompress = _e;
          break;
        default:
          throw "EXRLoader.parse: " + f.compression + " is unsupported";
      }
      if (W.scanlineBlockSize = W.lines, W.type == 1)
        switch (z) {
          case zr:
            W.getter = Lr, W.inputSize = 2;
            break;
          case Fr:
            W.getter = Ne, W.inputSize = 2;
            break;
        }
      else if (W.type == 2)
        switch (z) {
          case zr:
            W.getter = We, W.inputSize = 4;
            break;
          case Fr:
            W.getter = Qe, W.inputSize = 4;
        }
      else
        throw "EXRLoader.parse: unsupported pixelType " + W.type + " for " + f.compression + ".";
      W.blockCount = (f.dataWindow.yMax + 1) / W.scanlineBlockSize;
      for (var re = 0; re < W.blockCount; re++)
        Ge(v, F);
      W.outputChannels = W.channels == 3 ? 4 : W.channels;
      const Q = W.width * W.height * W.outputChannels;
      switch (z) {
        case zr:
          W.byteArray = new Float32Array(Q), W.channels < W.outputChannels && W.byteArray.fill(1, 0, Q);
          break;
        case Fr:
          W.byteArray = new Uint16Array(Q), W.channels < W.outputChannels && W.byteArray.fill(15360, 0, Q);
          break;
        default:
          console.error("THREE.EXRLoader: unsupported type: ", z);
          break;
      }
      return W.bytesPerLine = W.width * W.inputSize * W.channels, W.outputChannels == 4 ? W.format = yt : W.format = Ro, ft ? W.colorSpace = "srgb-linear" : W.encoding = 3e3, W;
    }
    const br = new DataView(r), kr = new Uint8Array(r), yr = { value: 0 }, Er = sr(br, r, yr), Ce = Sr(Er, br, kr, yr, this.type), dr = { value: 0 }, Br = { R: 0, G: 1, B: 2, A: 3, Y: 0 };
    for (let f = 0; f < Ce.height / Ce.scanlineBlockSize; f++) {
      const v = Me(br, yr);
      Ce.size = Me(br, yr), Ce.lines = v + Ce.scanlineBlockSize > Ce.height ? Ce.height - v : Ce.scanlineBlockSize;
      const F = Ce.size < Ce.lines * Ce.bytesPerLine ? Ce.uncompress(Ce) : ce(Ce);
      yr.value += Ce.size;
      for (let z = 0; z < Ce.scanlineBlockSize; z++) {
        const W = z + f * Ce.scanlineBlockSize;
        if (W >= Ce.height)
          break;
        for (let re = 0; re < Ce.channels; re++) {
          const Q = Br[Er.channels[re].name];
          for (let ne = 0; ne < Ce.width; ne++) {
            dr.value = (z * (Ce.channels * Ce.width) + re * Ce.width + ne) * Ce.inputSize;
            const ae = (Ce.height - 1 - W) * (Ce.width * Ce.outputChannels) + ne * Ce.outputChannels + Q;
            Ce.byteArray[ae] = Ce.getter(F, dr);
          }
        }
      }
    }
    return {
      header: Er,
      width: Ce.width,
      height: Ce.height,
      data: Ce.byteArray,
      format: Ce.format,
      [ft ? "colorSpace" : "encoding"]: Ce[ft ? "colorSpace" : "encoding"],
      type: this.type
    };
  }
  setDataType(r) {
    return this.type = r, this;
  }
  load(r, u, c, t) {
    function e(n, s) {
      ft ? n.colorSpace = s.colorSpace : n.encoding = s.encoding, n.minFilter = Ur, n.magFilter = Ur, n.generateMipmaps = !1, n.flipY = !1, u && u(n, s);
    }
    return super.load(r, e, c, t);
  }
}
function Yi() {
  var o = /* @__PURE__ */ Object.create(null);
  function r(t, e) {
    var n = t.id, s = t.name, a = t.dependencies;
    a === void 0 && (a = []);
    var i = t.init;
    i === void 0 && (i = function() {
    });
    var l = t.getTransferables;
    if (l === void 0 && (l = null), !o[n])
      try {
        a = a.map(function(d) {
          return d && d.isWorkerModule && (r(d, function(p) {
            if (p instanceof Error)
              throw p;
          }), d = o[d.id].value), d;
        }), i = c("<" + s + ">.init", i), l && (l = c("<" + s + ">.getTransferables", l));
        var h = null;
        typeof i == "function" ? h = i.apply(void 0, a) : console.error("worker module init function failed to rehydrate"), o[n] = {
          id: n,
          value: h,
          getTransferables: l
        }, e(h);
      } catch (d) {
        d && d.noLog || console.error(d), e(d);
      }
  }
  function u(t, e) {
    var n, s = t.id, a = t.args;
    (!o[s] || typeof o[s].value != "function") && e(new Error("Worker module " + s + ": not found or its 'init' did not return a function"));
    try {
      var i = (n = o[s]).value.apply(n, a);
      i && typeof i.then == "function" ? i.then(l, function(h) {
        return e(h instanceof Error ? h : new Error("" + h));
      }) : l(i);
    } catch (h) {
      e(h);
    }
    function l(h) {
      try {
        var d = o[s].getTransferables && o[s].getTransferables(h);
        (!d || !Array.isArray(d) || !d.length) && (d = void 0), e(h, d);
      } catch (p) {
        console.error(p), e(p);
      }
    }
  }
  function c(t, e) {
    var n = void 0;
    self.troikaDefine = function(a) {
      return n = a;
    };
    var s = URL.createObjectURL(
      new Blob(
        ["/** " + t.replace(/\*/g, "") + ` **/

troikaDefine(
` + e + `
)`],
        { type: "application/javascript" }
      )
    );
    try {
      importScripts(s);
    } catch (a) {
      console.error(a);
    }
    return URL.revokeObjectURL(s), delete self.troikaDefine, n;
  }
  self.addEventListener("message", function(t) {
    var e = t.data, n = e.messageId, s = e.action, a = e.data;
    try {
      s === "registerModule" && r(a, function(i) {
        i instanceof Error ? postMessage({
          messageId: n,
          success: !1,
          error: i.message
        }) : postMessage({
          messageId: n,
          success: !0,
          result: { isCallable: typeof i == "function" }
        });
      }), s === "callModule" && u(a, function(i, l) {
        i instanceof Error ? postMessage({
          messageId: n,
          success: !1,
          error: i.message
        }) : postMessage({
          messageId: n,
          success: !0,
          result: i
        }, l || void 0);
      });
    } catch (i) {
      postMessage({
        messageId: n,
        success: !1,
        error: i.stack
      });
    }
  });
}
function Ki(o) {
  var r = function() {
    for (var u = [], c = arguments.length; c--; ) u[c] = arguments[c];
    return r._getInitResult().then(function(t) {
      if (typeof t == "function")
        return t.apply(void 0, u);
      throw new Error("Worker module function was called but `init` did not return a callable function");
    });
  };
  return r._getInitResult = function() {
    var u = o.dependencies, c = o.init;
    u = Array.isArray(u) ? u.map(function(e) {
      return e && (e = e.onMainThread || e, e._getInitResult && (e = e._getInitResult())), e;
    }) : [];
    var t = Promise.all(u).then(function(e) {
      return c.apply(null, e);
    });
    return r._getInitResult = function() {
      return t;
    }, t;
  }, r;
}
var Ja = function() {
  var o = !1;
  if (typeof window < "u" && typeof window.document < "u")
    try {
      var r = new Worker(
        URL.createObjectURL(new Blob([""], { type: "application/javascript" }))
      );
      r.terminate(), o = !0;
    } catch (u) {
      console.log(
        "Troika createWorkerModule: web workers not allowed; falling back to main thread execution. Cause: [" + u.message + "]"
      );
    }
  return Ja = function() {
    return o;
  }, o;
}, qi = 0, Ji = 0, cn = !1, gt = /* @__PURE__ */ Object.create(null), mt = /* @__PURE__ */ Object.create(null), yn = /* @__PURE__ */ Object.create(null);
function nt(o) {
  if ((!o || typeof o.init != "function") && !cn)
    throw new Error("requires `options.init` function");
  var r = o.dependencies, u = o.init, c = o.getTransferables, t = o.workerId, e = Ki(o);
  t == null && (t = "#default");
  var n = "workerModule" + ++qi, s = o.name || n, a = null;
  r = r && r.map(function(l) {
    return typeof l == "function" && !l.workerModuleData && (cn = !0, l = nt({
      workerId: t,
      name: "<" + s + "> function dependency: " + l.name,
      init: `function(){return (
` + Pt(l) + `
)}`
    }), cn = !1), l && l.workerModuleData && (l = l.workerModuleData), l;
  });
  function i() {
    for (var l = [], h = arguments.length; h--; ) l[h] = arguments[h];
    if (!Ja())
      return e.apply(void 0, l);
    if (!a) {
      a = sa(t, "registerModule", i.workerModuleData);
      var d = function() {
        a = null, mt[t].delete(d);
      };
      (mt[t] || (mt[t] = /* @__PURE__ */ new Set())).add(d);
    }
    return a.then(function(p) {
      var g = p.isCallable;
      if (g)
        return sa(t, "callModule", { id: n, args: l });
      throw new Error("Worker module function was called but `init` did not return a callable function");
    });
  }
  return i.workerModuleData = {
    isWorkerModule: !0,
    id: n,
    name: s,
    dependencies: r,
    init: Pt(u),
    getTransferables: c && Pt(c)
  }, i.onMainThread = e, i;
}
function Qi(o) {
  mt[o] && mt[o].forEach(function(r) {
    r();
  }), gt[o] && (gt[o].terminate(), delete gt[o]);
}
function Pt(o) {
  var r = o.toString();
  return !/^function/.test(r) && /^\w+\s*\(/.test(r) && (r = "function " + r), r;
}
function $i(o) {
  var r = gt[o];
  if (!r) {
    var u = Pt(Yi);
    r = gt[o] = new Worker(
      URL.createObjectURL(
        new Blob(
          ["/** Worker Module Bootstrap: " + o.replace(/\*/g, "") + ` **/

;(` + u + ")()"],
          { type: "application/javascript" }
        )
      )
    ), r.onmessage = function(c) {
      var t = c.data, e = t.messageId, n = yn[e];
      if (!n)
        throw new Error("WorkerModule response with empty or unknown messageId");
      delete yn[e], n(t);
    };
  }
  return r;
}
function sa(o, r, u) {
  return new Promise(function(c, t) {
    var e = ++Ji;
    yn[e] = function(n) {
      n.success ? c(n.result) : t(new Error("Error in worker " + r + " call: " + n.error));
    }, $i(o).postMessage({
      messageId: e,
      action: r,
      data: u
    });
  });
}
function Qa() {
  var o = (function(r) {
    function u(Z, G, _, E, D, N, B, V) {
      var j = 1 - B;
      V.x = j * j * Z + 2 * j * B * _ + B * B * D, V.y = j * j * G + 2 * j * B * E + B * B * N;
    }
    function c(Z, G, _, E, D, N, B, V, j, Y) {
      var ue = 1 - j;
      Y.x = ue * ue * ue * Z + 3 * ue * ue * j * _ + 3 * ue * j * j * D + j * j * j * B, Y.y = ue * ue * ue * G + 3 * ue * ue * j * E + 3 * ue * j * j * N + j * j * j * V;
    }
    function t(Z, G) {
      for (var _ = /([MLQCZ])([^MLQCZ]*)/g, E, D, N, B, V; E = _.exec(Z); ) {
        var j = E[2].replace(/^\s*|\s*$/g, "").split(/[,\s]+/).map(function(Y) {
          return parseFloat(Y);
        });
        switch (E[1]) {
          case "M":
            B = D = j[0], V = N = j[1];
            break;
          case "L":
            (j[0] !== B || j[1] !== V) && G("L", B, V, B = j[0], V = j[1]);
            break;
          case "Q": {
            G("Q", B, V, B = j[2], V = j[3], j[0], j[1]);
            break;
          }
          case "C": {
            G("C", B, V, B = j[4], V = j[5], j[0], j[1], j[2], j[3]);
            break;
          }
          case "Z":
            (B !== D || V !== N) && G("L", B, V, D, N);
            break;
        }
      }
    }
    function e(Z, G, _) {
      _ === void 0 && (_ = 16);
      var E = { x: 0, y: 0 };
      t(Z, function(D, N, B, V, j, Y, ue, ve, oe) {
        switch (D) {
          case "L":
            G(N, B, V, j);
            break;
          case "Q": {
            for (var $ = N, Fe = B, Te = 1; Te < _; Te++)
              u(
                N,
                B,
                Y,
                ue,
                V,
                j,
                Te / (_ - 1),
                E
              ), G($, Fe, E.x, E.y), $ = E.x, Fe = E.y;
            break;
          }
          case "C": {
            for (var fe = N, ge = B, Ee = 1; Ee < _; Ee++)
              c(
                N,
                B,
                Y,
                ue,
                ve,
                oe,
                V,
                j,
                Ee / (_ - 1),
                E
              ), G(fe, ge, E.x, E.y), fe = E.x, ge = E.y;
            break;
          }
        }
      });
    }
    var n = "precision highp float;attribute vec2 aUV;varying vec2 vUV;void main(){vUV=aUV;gl_Position=vec4(mix(vec2(-1.0),vec2(1.0),aUV),0.0,1.0);}", s = "precision highp float;uniform sampler2D tex;varying vec2 vUV;void main(){gl_FragColor=texture2D(tex,vUV);}", a = /* @__PURE__ */ new WeakMap(), i = {
      premultipliedAlpha: !1,
      preserveDrawingBuffer: !0,
      antialias: !1,
      depth: !1
    };
    function l(Z, G) {
      var _ = Z.getContext ? Z.getContext("webgl", i) : Z, E = a.get(_);
      if (!E) {
        let ue = function(fe) {
          var ge = N[fe];
          if (!ge && (ge = N[fe] = _.getExtension(fe), !ge))
            throw new Error(fe + " not supported");
          return ge;
        }, ve = function(fe, ge) {
          var Ee = _.createShader(ge);
          return _.shaderSource(Ee, fe), _.compileShader(Ee), Ee;
        }, oe = function(fe, ge, Ee, te) {
          if (!B[fe]) {
            var me = {}, de = {}, q = _.createProgram();
            _.attachShader(q, ve(ge, _.VERTEX_SHADER)), _.attachShader(q, ve(Ee, _.FRAGMENT_SHADER)), _.linkProgram(q), B[fe] = {
              program: q,
              transaction: function(ce) {
                _.useProgram(q), ce({
                  setUniform: function(le, ze) {
                    for (var ye = [], _e = arguments.length - 2; _e-- > 0; ) ye[_e] = arguments[_e + 2];
                    var Se = de[ze] || (de[ze] = _.getUniformLocation(q, ze));
                    _["uniform" + le].apply(_, [Se].concat(ye));
                  },
                  setAttribute: function(le, ze, ye, _e, Se) {
                    var ke = me[le];
                    ke || (ke = me[le] = {
                      buf: _.createBuffer(),
                      // TODO should we destroy our buffers?
                      loc: _.getAttribLocation(q, le),
                      data: null
                    }), _.bindBuffer(_.ARRAY_BUFFER, ke.buf), _.vertexAttribPointer(ke.loc, ze, _.FLOAT, !1, 0, 0), _.enableVertexAttribArray(ke.loc), D ? _.vertexAttribDivisor(ke.loc, _e) : ue("ANGLE_instanced_arrays").vertexAttribDivisorANGLE(ke.loc, _e), Se !== ke.data && (_.bufferData(_.ARRAY_BUFFER, Se, ye), ke.data = Se);
                  }
                });
              }
            };
          }
          B[fe].transaction(te);
        }, $ = function(fe, ge) {
          j++;
          try {
            _.activeTexture(_.TEXTURE0 + j);
            var Ee = V[fe];
            Ee || (Ee = V[fe] = _.createTexture(), _.bindTexture(_.TEXTURE_2D, Ee), _.texParameteri(_.TEXTURE_2D, _.TEXTURE_MIN_FILTER, _.NEAREST), _.texParameteri(_.TEXTURE_2D, _.TEXTURE_MAG_FILTER, _.NEAREST)), _.bindTexture(_.TEXTURE_2D, Ee), ge(Ee, j);
          } finally {
            j--;
          }
        }, Fe = function(fe, ge, Ee) {
          var te = _.createFramebuffer();
          Y.push(te), _.bindFramebuffer(_.FRAMEBUFFER, te), _.activeTexture(_.TEXTURE0 + ge), _.bindTexture(_.TEXTURE_2D, fe), _.framebufferTexture2D(_.FRAMEBUFFER, _.COLOR_ATTACHMENT0, _.TEXTURE_2D, fe, 0);
          try {
            Ee(te);
          } finally {
            _.deleteFramebuffer(te), _.bindFramebuffer(_.FRAMEBUFFER, Y[--Y.length - 1] || null);
          }
        }, Te = function() {
          N = {}, B = {}, V = {}, j = -1, Y.length = 0;
        };
        var D = typeof WebGL2RenderingContext < "u" && _ instanceof WebGL2RenderingContext, N = {}, B = {}, V = {}, j = -1, Y = [];
        _.canvas.addEventListener("webglcontextlost", function(fe) {
          Te(), fe.preventDefault();
        }, !1), a.set(_, E = {
          gl: _,
          isWebGL2: D,
          getExtension: ue,
          withProgram: oe,
          withTexture: $,
          withTextureFramebuffer: Fe,
          handleContextLoss: Te
        });
      }
      G(E);
    }
    function h(Z, G, _, E, D, N, B, V) {
      B === void 0 && (B = 15), V === void 0 && (V = null), l(Z, function(j) {
        var Y = j.gl, ue = j.withProgram, ve = j.withTexture;
        ve("copy", function(oe, $) {
          Y.texImage2D(Y.TEXTURE_2D, 0, Y.RGBA, D, N, 0, Y.RGBA, Y.UNSIGNED_BYTE, G), ue("copy", n, s, function(Fe) {
            var Te = Fe.setUniform, fe = Fe.setAttribute;
            fe("aUV", 2, Y.STATIC_DRAW, 0, new Float32Array([0, 0, 2, 0, 0, 2])), Te("1i", "image", $), Y.bindFramebuffer(Y.FRAMEBUFFER, V || null), Y.disable(Y.BLEND), Y.colorMask(B & 8, B & 4, B & 2, B & 1), Y.viewport(_, E, D, N), Y.scissor(_, E, D, N), Y.drawArrays(Y.TRIANGLES, 0, 3);
          });
        });
      });
    }
    function d(Z, G, _) {
      var E = Z.width, D = Z.height;
      l(Z, function(N) {
        var B = N.gl, V = new Uint8Array(E * D * 4);
        B.readPixels(0, 0, E, D, B.RGBA, B.UNSIGNED_BYTE, V), Z.width = G, Z.height = _, h(B, V, 0, 0, E, D);
      });
    }
    var p = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      withWebGLContext: l,
      renderImageData: h,
      resizeWebGLCanvasWithoutClearing: d
    });
    function g(Z, G, _, E, D, N) {
      N === void 0 && (N = 1);
      var B = new Uint8Array(Z * G), V = E[2] - E[0], j = E[3] - E[1], Y = [];
      e(_, function(fe, ge, Ee, te) {
        Y.push({
          x1: fe,
          y1: ge,
          x2: Ee,
          y2: te,
          minX: Math.min(fe, Ee),
          minY: Math.min(ge, te),
          maxX: Math.max(fe, Ee),
          maxY: Math.max(ge, te)
        });
      }), Y.sort(function(fe, ge) {
        return fe.maxX - ge.maxX;
      });
      for (var ue = 0; ue < Z; ue++)
        for (var ve = 0; ve < G; ve++) {
          var oe = Fe(
            E[0] + V * (ue + 0.5) / Z,
            E[1] + j * (ve + 0.5) / G
          ), $ = Math.pow(1 - Math.abs(oe) / D, N) / 2;
          oe < 0 && ($ = 1 - $), $ = Math.max(0, Math.min(255, Math.round($ * 255))), B[ve * Z + ue] = $;
        }
      return B;
      function Fe(fe, ge) {
        for (var Ee = 1 / 0, te = 1 / 0, me = Y.length; me--; ) {
          var de = Y[me];
          if (de.maxX + te <= fe)
            break;
          if (fe + te > de.minX && ge - te < de.maxY && ge + te > de.minY) {
            var q = I(fe, ge, de.x1, de.y1, de.x2, de.y2);
            q < Ee && (Ee = q, te = Math.sqrt(Ee));
          }
        }
        return Te(fe, ge) && (te = -te), te;
      }
      function Te(fe, ge) {
        for (var Ee = 0, te = Y.length; te--; ) {
          var me = Y[te];
          if (me.maxX <= fe)
            break;
          var de = me.y1 > ge != me.y2 > ge && fe < (me.x2 - me.x1) * (ge - me.y1) / (me.y2 - me.y1) + me.x1;
          de && (Ee += me.y1 < me.y2 ? 1 : -1);
        }
        return Ee !== 0;
      }
    }
    function S(Z, G, _, E, D, N, B, V, j, Y) {
      N === void 0 && (N = 1), V === void 0 && (V = 0), j === void 0 && (j = 0), Y === void 0 && (Y = 0), w(Z, G, _, E, D, N, B, null, V, j, Y);
    }
    function w(Z, G, _, E, D, N, B, V, j, Y, ue) {
      N === void 0 && (N = 1), j === void 0 && (j = 0), Y === void 0 && (Y = 0), ue === void 0 && (ue = 0);
      for (var ve = g(Z, G, _, E, D, N), oe = new Uint8Array(ve.length * 4), $ = 0; $ < ve.length; $++)
        oe[$ * 4 + ue] = ve[$];
      h(B, oe, j, Y, Z, G, 1 << 3 - ue, V);
    }
    function I(Z, G, _, E, D, N) {
      var B = D - _, V = N - E, j = B * B + V * V, Y = j ? Math.max(0, Math.min(1, ((Z - _) * B + (G - E) * V) / j)) : 0, ue = Z - (_ + Y * B), ve = G - (E + Y * V);
      return ue * ue + ve * ve;
    }
    var A = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      generate: g,
      generateIntoCanvas: S,
      generateIntoFramebuffer: w
    }), k = "precision highp float;uniform vec4 uGlyphBounds;attribute vec2 aUV;attribute vec4 aLineSegment;varying vec4 vLineSegment;varying vec2 vGlyphXY;void main(){vLineSegment=aLineSegment;vGlyphXY=mix(uGlyphBounds.xy,uGlyphBounds.zw,aUV);gl_Position=vec4(mix(vec2(-1.0),vec2(1.0),aUV),0.0,1.0);}", T = "precision highp float;uniform vec4 uGlyphBounds;uniform float uMaxDistance;uniform float uExponent;varying vec4 vLineSegment;varying vec2 vGlyphXY;float absDistToSegment(vec2 point,vec2 lineA,vec2 lineB){vec2 lineDir=lineB-lineA;float lenSq=dot(lineDir,lineDir);float t=lenSq==0.0 ? 0.0 : clamp(dot(point-lineA,lineDir)/lenSq,0.0,1.0);vec2 linePt=lineA+t*lineDir;return distance(point,linePt);}void main(){vec4 seg=vLineSegment;vec2 p=vGlyphXY;float dist=absDistToSegment(p,seg.xy,seg.zw);float val=pow(1.0-clamp(dist/uMaxDistance,0.0,1.0),uExponent)*0.5;bool crossing=(seg.y>p.y!=seg.w>p.y)&&(p.x<(seg.z-seg.x)*(p.y-seg.y)/(seg.w-seg.y)+seg.x);bool crossingUp=crossing&&vLineSegment.y<vLineSegment.w;gl_FragColor=vec4(crossingUp ? 1.0/255.0 : 0.0,crossing&&!crossingUp ? 1.0/255.0 : 0.0,0.0,val);}", U = "precision highp float;uniform sampler2D tex;varying vec2 vUV;void main(){vec4 color=texture2D(tex,vUV);bool inside=color.r!=color.g;float val=inside ? 1.0-color.a : color.a;gl_FragColor=vec4(val);}", O = new Float32Array([0, 0, 2, 0, 0, 2]), C = null, y = !1, M = {}, L = /* @__PURE__ */ new WeakMap();
    function ee(Z) {
      if (!y && !K(Z))
        throw new Error("WebGL generation not supported");
    }
    function x(Z, G, _, E, D, N, B) {
      if (N === void 0 && (N = 1), B === void 0 && (B = null), !B && (B = C, !B)) {
        var V = typeof OffscreenCanvas == "function" ? new OffscreenCanvas(1, 1) : typeof document < "u" ? document.createElement("canvas") : null;
        if (!V)
          throw new Error("OffscreenCanvas or DOM canvas not supported");
        B = C = V.getContext("webgl", { depth: !1 });
      }
      ee(B);
      var j = new Uint8Array(Z * G * 4);
      l(B, function(oe) {
        var $ = oe.gl, Fe = oe.withTexture, Te = oe.withTextureFramebuffer;
        Fe("readable", function(fe, ge) {
          $.texImage2D($.TEXTURE_2D, 0, $.RGBA, Z, G, 0, $.RGBA, $.UNSIGNED_BYTE, null), Te(fe, ge, function(Ee) {
            b(
              Z,
              G,
              _,
              E,
              D,
              N,
              $,
              Ee,
              0,
              0,
              0
              // red channel
            ), $.readPixels(0, 0, Z, G, $.RGBA, $.UNSIGNED_BYTE, j);
          });
        });
      });
      for (var Y = new Uint8Array(Z * G), ue = 0, ve = 0; ue < j.length; ue += 4)
        Y[ve++] = j[ue];
      return Y;
    }
    function R(Z, G, _, E, D, N, B, V, j, Y) {
      N === void 0 && (N = 1), V === void 0 && (V = 0), j === void 0 && (j = 0), Y === void 0 && (Y = 0), b(Z, G, _, E, D, N, B, null, V, j, Y);
    }
    function b(Z, G, _, E, D, N, B, V, j, Y, ue) {
      N === void 0 && (N = 1), j === void 0 && (j = 0), Y === void 0 && (Y = 0), ue === void 0 && (ue = 0), ee(B);
      var ve = [];
      e(_, function(oe, $, Fe, Te) {
        ve.push(oe, $, Fe, Te);
      }), ve = new Float32Array(ve), l(B, function(oe) {
        var $ = oe.gl, Fe = oe.isWebGL2, Te = oe.getExtension, fe = oe.withProgram, ge = oe.withTexture, Ee = oe.withTextureFramebuffer, te = oe.handleContextLoss;
        if (ge("rawDistances", function(me, de) {
          (Z !== me._lastWidth || G !== me._lastHeight) && $.texImage2D(
            $.TEXTURE_2D,
            0,
            $.RGBA,
            me._lastWidth = Z,
            me._lastHeight = G,
            0,
            $.RGBA,
            $.UNSIGNED_BYTE,
            null
          ), fe("main", k, T, function(q) {
            var Ae = q.setAttribute, ce = q.setUniform, xe = !Fe && Te("ANGLE_instanced_arrays"), le = !Fe && Te("EXT_blend_minmax");
            Ae("aUV", 2, $.STATIC_DRAW, 0, O), Ae("aLineSegment", 4, $.DYNAMIC_DRAW, 1, ve), ce.apply(void 0, ["4f", "uGlyphBounds"].concat(E)), ce("1f", "uMaxDistance", D), ce("1f", "uExponent", N), Ee(me, de, function(ze) {
              $.enable($.BLEND), $.colorMask(!0, !0, !0, !0), $.viewport(0, 0, Z, G), $.scissor(0, 0, Z, G), $.blendFunc($.ONE, $.ONE), $.blendEquationSeparate($.FUNC_ADD, Fe ? $.MAX : le.MAX_EXT), $.clear($.COLOR_BUFFER_BIT), Fe ? $.drawArraysInstanced($.TRIANGLES, 0, 3, ve.length / 4) : xe.drawArraysInstancedANGLE($.TRIANGLES, 0, 3, ve.length / 4);
            });
          }), fe("post", n, U, function(q) {
            q.setAttribute("aUV", 2, $.STATIC_DRAW, 0, O), q.setUniform("1i", "tex", de), $.bindFramebuffer($.FRAMEBUFFER, V), $.disable($.BLEND), $.colorMask(ue === 0, ue === 1, ue === 2, ue === 3), $.viewport(j, Y, Z, G), $.scissor(j, Y, Z, G), $.drawArrays($.TRIANGLES, 0, 3);
          });
        }), $.isContextLost())
          throw te(), new Error("webgl context lost");
      });
    }
    function K(Z) {
      var G = !Z || Z === C ? M : Z.canvas || Z, _ = L.get(G);
      if (_ === void 0) {
        y = !0;
        var E = null;
        try {
          var D = [
            97,
            106,
            97,
            61,
            99,
            137,
            118,
            80,
            80,
            118,
            137,
            99,
            61,
            97,
            106,
            97
          ], N = x(
            4,
            4,
            "M8,8L16,8L24,24L16,24Z",
            [0, 0, 32, 32],
            24,
            1,
            Z
          );
          _ = N && D.length === N.length && N.every(function(B, V) {
            return B === D[V];
          }), _ || (E = "bad trial run results", console.info(D, N));
        } catch (B) {
          _ = !1, E = B.message;
        }
        E && console.warn("WebGL SDF generation not supported:", E), y = !1, L.set(G, _);
      }
      return _;
    }
    var H = /* @__PURE__ */ Object.freeze({
      __proto__: null,
      generate: x,
      generateIntoCanvas: R,
      generateIntoFramebuffer: b,
      isSupported: K
    });
    function se(Z, G, _, E, D, N) {
      D === void 0 && (D = Math.max(E[2] - E[0], E[3] - E[1]) / 2), N === void 0 && (N = 1);
      try {
        return x.apply(H, arguments);
      } catch (B) {
        return console.info("WebGL SDF generation failed, falling back to JS", B), g.apply(A, arguments);
      }
    }
    function he(Z, G, _, E, D, N, B, V, j, Y) {
      D === void 0 && (D = Math.max(E[2] - E[0], E[3] - E[1]) / 2), N === void 0 && (N = 1), V === void 0 && (V = 0), j === void 0 && (j = 0), Y === void 0 && (Y = 0);
      try {
        return R.apply(H, arguments);
      } catch (ue) {
        return console.info("WebGL SDF generation failed, falling back to JS", ue), S.apply(A, arguments);
      }
    }
    return r.forEachPathCommand = t, r.generate = se, r.generateIntoCanvas = he, r.javascript = A, r.pathToLineSegments = e, r.webgl = H, r.webglUtils = p, Object.defineProperty(r, "__esModule", { value: !0 }), r;
  })({});
  return o;
}
function es() {
  var o = (function(r) {
    var u = {
      R: "13k,1a,2,3,3,2+1j,ch+16,a+1,5+2,2+n,5,a,4,6+16,4+3,h+1b,4mo,179q,2+9,2+11,2i9+7y,2+68,4,3+4,5+13,4+3,2+4k,3+29,8+cf,1t+7z,w+17,3+3m,1t+3z,16o1+5r,8+30,8+mc,29+1r,29+4v,75+73",
      EN: "1c+9,3d+1,6,187+9,513,4+5,7+9,sf+j,175h+9,qw+q,161f+1d,4xt+a,25i+9",
      ES: "17,2,6dp+1,f+1,av,16vr,mx+1,4o,2",
      ET: "z+2,3h+3,b+1,ym,3e+1,2o,p4+1,8,6u,7c,g6,1wc,1n9+4,30+1b,2n,6d,qhx+1,h0m,a+1,49+2,63+1,4+1,6bb+3,12jj",
      AN: "16o+5,2j+9,2+1,35,ed,1ff2+9,87+u",
      CS: "18,2+1,b,2u,12k,55v,l,17v0,2,3,53,2+1,b",
      B: "a,3,f+2,2v,690",
      S: "9,2,k",
      WS: "c,k,4f4,1vk+a,u,1j,335",
      ON: "x+1,4+4,h+5,r+5,r+3,z,5+3,2+1,2+1,5,2+2,3+4,o,w,ci+1,8+d,3+d,6+8,2+g,39+1,9,6+1,2,33,b8,3+1,3c+1,7+1,5r,b,7h+3,sa+5,2,3i+6,jg+3,ur+9,2v,ij+1,9g+9,7+a,8m,4+1,49+x,14u,2+2,c+2,e+2,e+2,e+1,i+n,e+e,2+p,u+2,e+2,36+1,2+3,2+1,b,2+2,6+5,2,2,2,h+1,5+4,6+3,3+f,16+2,5+3l,3+81,1y+p,2+40,q+a,m+13,2r+ch,2+9e,75+hf,3+v,2+2w,6e+5,f+6,75+2a,1a+p,2+2g,d+5x,r+b,6+3,4+o,g,6+1,6+2,2k+1,4,2j,5h+z,1m+1,1e+f,t+2,1f+e,d+3,4o+3,2s+1,w,535+1r,h3l+1i,93+2,2s,b+1,3l+x,2v,4g+3,21+3,kz+1,g5v+1,5a,j+9,n+v,2,3,2+8,2+1,3+2,2,3,46+1,4+4,h+5,r+5,r+a,3h+2,4+6,b+4,78,1r+24,4+c,4,1hb,ey+6,103+j,16j+c,1ux+7,5+g,fsh,jdq+1t,4,57+2e,p1,1m,1m,1m,1m,4kt+1,7j+17,5+2r,d+e,3+e,2+e,2+10,m+4,w,1n+5,1q,4z+5,4b+rb,9+c,4+c,4+37,d+2g,8+b,l+b,5+1j,9+9,7+13,9+t,3+1,27+3c,2+29,2+3q,d+d,3+4,4+2,6+6,a+o,8+6,a+2,e+6,16+42,2+1i",
      BN: "0+8,6+d,2s+5,2+p,e,4m9,1kt+2,2b+5,5+5,17q9+v,7k,6p+8,6+1,119d+3,440+7,96s+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+1,1ekf+75,6p+2rz,1ben+1,1ekf+1,1ekf+1",
      NSM: "lc+33,7o+6,7c+18,2,2+1,2+1,2,21+a,1d+k,h,2u+6,3+5,3+1,2+3,10,v+q,2k+a,1n+8,a,p+3,2+8,2+2,2+4,18+2,3c+e,2+v,1k,2,5+7,5,4+6,b+1,u,1n,5+3,9,l+1,r,3+1,1m,5+1,5+1,3+2,4,v+1,4,c+1,1m,5+4,2+1,5,l+1,n+5,2,1n,3,2+3,9,8+1,c+1,v,1q,d,1f,4,1m+2,6+2,2+3,8+1,c+1,u,1n,g+1,l+1,t+1,1m+1,5+3,9,l+1,u,21,8+2,2,2j,3+6,d+7,2r,3+8,c+5,23+1,s,2,2,1k+d,2+4,2+1,6+a,2+z,a,2v+3,2+5,2+1,3+1,q+1,5+2,h+3,e,3+1,7,g,jk+2,qb+2,u+2,u+1,v+1,1t+1,2+6,9,3+a,a,1a+2,3c+1,z,3b+2,5+1,a,7+2,64+1,3,1n,2+6,2,2,3+7,7+9,3,1d+g,1s+3,1d,2+4,2,6,15+8,d+1,x+3,3+1,2+2,1l,2+1,4,2+2,1n+7,3+1,49+2,2+c,2+6,5,7,4+1,5j+1l,2+4,k1+w,2db+2,3y,2p+v,ff+3,30+1,n9x+3,2+9,x+1,29+1,7l,4,5,q+1,6,48+1,r+h,e,13+7,q+a,1b+2,1d,3+3,3+1,14,1w+5,3+1,3+1,d,9,1c,1g,2+2,3+1,6+1,2,17+1,9,6n,3,5,fn5,ki+f,h+f,r2,6b,46+4,1af+2,2+1,6+3,15+2,5,4m+1,fy+3,as+1,4a+a,4x,1j+e,1l+2,1e+3,3+1,1y+2,11+4,2+7,1r,d+1,1h+8,b+3,3,2o+2,3,2+1,7,4h,4+7,m+1,1m+1,4,12+6,4+4,5g+7,3+2,2,o,2d+5,2,5+1,2+1,6n+3,7+1,2+1,s+1,2e+7,3,2+1,2z,2,3+5,2,2u+2,3+3,2+4,78+8,2+1,75+1,2,5,41+3,3+1,5,x+5,3+1,15+5,3+3,9,a+5,3+2,1b+c,2+1,bb+6,2+5,2d+l,3+6,2+1,2+1,3f+5,4,2+1,2+6,2,21+1,4,2,9o+1,f0c+4,1o+6,t5,1s+3,2a,f5l+1,43t+2,i+7,3+6,v+3,45+2,1j0+1i,5+1d,9,f,n+4,2+e,11t+6,2+g,3+6,2+1,2+4,7a+6,c6+3,15t+6,32+6,gzhy+6n",
      AL: "16w,3,2,e+1b,z+2,2+2s,g+1,8+1,b+m,2+t,s+2i,c+e,4h+f,1d+1e,1bwe+dp,3+3z,x+c,2+1,35+3y,2rm+z,5+7,b+5,dt+l,c+u,17nl+27,1t+27,4x+6n,3+d",
      LRO: "6ct",
      RLO: "6cu",
      LRE: "6cq",
      RLE: "6cr",
      PDF: "6cs",
      LRI: "6ee",
      RLI: "6ef",
      FSI: "6eg",
      PDI: "6eh"
    }, c = {}, t = {};
    c.L = 1, t[1] = "L", Object.keys(u).forEach(function(te, me) {
      c[te] = 1 << me + 1, t[c[te]] = te;
    }), Object.freeze(c);
    var e = c.LRI | c.RLI | c.FSI, n = c.L | c.R | c.AL, s = c.B | c.S | c.WS | c.ON | c.FSI | c.LRI | c.RLI | c.PDI, a = c.BN | c.RLE | c.LRE | c.RLO | c.LRO | c.PDF, i = c.S | c.WS | c.B | e | c.PDI | a, l = null;
    function h() {
      if (!l) {
        l = /* @__PURE__ */ new Map();
        var te = function(de) {
          if (u.hasOwnProperty(de)) {
            var q = 0;
            u[de].split(",").forEach(function(Ae) {
              var ce = Ae.split("+"), xe = ce[0], le = ce[1];
              xe = parseInt(xe, 36), le = le ? parseInt(le, 36) : 0, l.set(q += xe, c[de]);
              for (var ze = 0; ze < le; ze++)
                l.set(++q, c[de]);
            });
          }
        };
        for (var me in u) te(me);
      }
    }
    function d(te) {
      return h(), l.get(te.codePointAt(0)) || c.L;
    }
    function p(te) {
      return t[d(te)];
    }
    var g = {
      pairs: "14>1,1e>2,u>2,2wt>1,1>1,1ge>1,1wp>1,1j>1,f>1,hm>1,1>1,u>1,u6>1,1>1,+5,28>1,w>1,1>1,+3,b8>1,1>1,+3,1>3,-1>-1,3>1,1>1,+2,1s>1,1>1,x>1,th>1,1>1,+2,db>1,1>1,+3,3>1,1>1,+2,14qm>1,1>1,+1,4q>1,1e>2,u>2,2>1,+1",
      canonical: "6f1>-6dx,6dy>-6dx,6ec>-6ed,6ee>-6ed,6ww>2jj,-2ji>2jj,14r4>-1e7l,1e7m>-1e7l,1e7m>-1e5c,1e5d>-1e5b,1e5c>-14qx,14qy>-14qx,14vn>-1ecg,1ech>-1ecg,1edu>-1ecg,1eci>-1ecg,1eda>-1ecg,1eci>-1ecg,1eci>-168q,168r>-168q,168s>-14ye,14yf>-14ye"
    };
    function S(te, me) {
      var de = 36, q = 0, Ae = /* @__PURE__ */ new Map(), ce = me && /* @__PURE__ */ new Map(), xe;
      return te.split(",").forEach(function le(ze) {
        if (ze.indexOf("+") !== -1)
          for (var ye = +ze; ye--; )
            le(xe);
        else {
          xe = ze;
          var _e = ze.split(">"), Se = _e[0], ke = _e[1];
          Se = String.fromCodePoint(q += parseInt(Se, de)), ke = String.fromCodePoint(q += parseInt(ke, de)), Ae.set(Se, ke), me && ce.set(ke, Se);
        }
      }), { map: Ae, reverseMap: ce };
    }
    var w, I, A;
    function k() {
      if (!w) {
        var te = S(g.pairs, !0), me = te.map, de = te.reverseMap;
        w = me, I = de, A = S(g.canonical, !1).map;
      }
    }
    function T(te) {
      return k(), w.get(te) || null;
    }
    function U(te) {
      return k(), I.get(te) || null;
    }
    function O(te) {
      return k(), A.get(te) || null;
    }
    var C = c.L, y = c.R, M = c.EN, L = c.ES, ee = c.ET, x = c.AN, R = c.CS, b = c.B, K = c.S, H = c.ON, se = c.BN, he = c.NSM, Z = c.AL, G = c.LRO, _ = c.RLO, E = c.LRE, D = c.RLE, N = c.PDF, B = c.LRI, V = c.RLI, j = c.FSI, Y = c.PDI;
    function ue(te, me) {
      for (var de = 125, q = new Uint32Array(te.length), Ae = 0; Ae < te.length; Ae++)
        q[Ae] = d(te[Ae]);
      var ce = /* @__PURE__ */ new Map();
      function xe(wr, Ir) {
        var xr = q[wr];
        q[wr] = Ir, ce.set(xr, ce.get(xr) - 1), xr & s && ce.set(s, ce.get(s) - 1), ce.set(Ir, (ce.get(Ir) || 0) + 1), Ir & s && ce.set(s, (ce.get(s) || 0) + 1);
      }
      for (var le = new Uint8Array(te.length), ze = /* @__PURE__ */ new Map(), ye = [], _e = null, Se = 0; Se < te.length; Se++)
        _e || ye.push(_e = {
          start: Se,
          end: te.length - 1,
          // 3.3.1 P2-P3: Determine the paragraph level
          level: me === "rtl" ? 1 : me === "ltr" ? 0 : ra(Se, !1)
        }), q[Se] & b && (_e.end = Se, _e = null);
      for (var ke = D | E | _ | G | e | Y | N | b, Je = function(wr) {
        return wr + (wr & 1 ? 1 : 2);
      }, tr = function(wr) {
        return wr + (wr & 1 ? 2 : 1);
      }, Re = 0; Re < ye.length; Re++) {
        _e = ye[Re];
        var Me = [{
          _level: _e.level,
          _override: 0,
          //0=neutral, 1=L, 2=R
          _isolate: 0
          //bool
        }], be = void 0, Ye = 0, Ge = 0, We = 0;
        ce.clear();
        for (var Qe = _e.start; Qe <= _e.end; Qe++) {
          var X = q[Qe];
          if (be = Me[Me.length - 1], ce.set(X, (ce.get(X) || 0) + 1), X & s && ce.set(s, (ce.get(s) || 0) + 1), X & ke)
            if (X & (D | E)) {
              le[Qe] = be._level;
              var Ne = (X === D ? tr : Je)(be._level);
              Ne <= de && !Ye && !Ge ? Me.push({
                _level: Ne,
                _override: 0,
                _isolate: 0
              }) : Ye || Ge++;
            } else if (X & (_ | G)) {
              le[Qe] = be._level;
              var Lr = (X === _ ? tr : Je)(be._level);
              Lr <= de && !Ye && !Ge ? Me.push({
                _level: Lr,
                _override: X & _ ? y : C,
                _isolate: 0
              }) : Ye || Ge++;
            } else if (X & e) {
              X & j && (X = ra(Qe + 1, !0) === 1 ? V : B), le[Qe] = be._level, be._override && xe(Qe, be._override);
              var Ze = (X === V ? tr : Je)(be._level);
              Ze <= de && Ye === 0 && Ge === 0 ? (We++, Me.push({
                _level: Ze,
                _override: 0,
                _isolate: 1,
                _isolInitIndex: Qe
              })) : Ye++;
            } else if (X & Y) {
              if (Ye > 0)
                Ye--;
              else if (We > 0) {
                for (Ge = 0; !Me[Me.length - 1]._isolate; )
                  Me.pop();
                var Pe = Me[Me.length - 1]._isolInitIndex;
                Pe != null && (ze.set(Pe, Qe), ze.set(Qe, Pe)), Me.pop(), We--;
              }
              be = Me[Me.length - 1], le[Qe] = be._level, be._override && xe(Qe, be._override);
            } else X & N ? (Ye === 0 && (Ge > 0 ? Ge-- : !be._isolate && Me.length > 1 && (Me.pop(), be = Me[Me.length - 1])), le[Qe] = be._level) : X & b && (le[Qe] = _e.level);
          else
            le[Qe] = be._level, be._override && X !== se && xe(Qe, be._override);
        }
        for (var ir = [], er = null, De = _e.start; De <= _e.end; De++) {
          var rr = q[De];
          if (!(rr & a)) {
            var pr = le[De], hr = rr & e, sr = rr === Y;
            er && pr === er._level ? (er._end = De, er._endsWithIsolInit = hr) : ir.push(er = {
              _start: De,
              _end: De,
              _level: pr,
              _startsWithPDI: sr,
              _endsWithIsolInit: hr
            });
          }
        }
        for (var Sr = [], br = 0; br < ir.length; br++) {
          var kr = ir[br];
          if (!kr._startsWithPDI || kr._startsWithPDI && !ze.has(kr._start)) {
            for (var yr = [er = kr], Er = void 0; er && er._endsWithIsolInit && (Er = ze.get(er._end)) != null; )
              for (var Ce = br + 1; Ce < ir.length; Ce++)
                if (ir[Ce]._start === Er) {
                  yr.push(er = ir[Ce]);
                  break;
                }
            for (var dr = [], Br = 0; Br < yr.length; Br++)
              for (var f = yr[Br], v = f._start; v <= f._end; v++)
                dr.push(v);
            for (var m = le[dr[0]], F = _e.level, z = dr[0] - 1; z >= 0; z--)
              if (!(q[z] & a)) {
                F = le[z];
                break;
              }
            var W = dr[dr.length - 1], re = le[W], Q = _e.level;
            if (!(q[W] & e)) {
              for (var ne = W + 1; ne <= _e.end; ne++)
                if (!(q[ne] & a)) {
                  Q = le[ne];
                  break;
                }
            }
            Sr.push({
              _seqIndices: dr,
              _sosType: Math.max(F, m) % 2 ? y : C,
              _eosType: Math.max(Q, re) % 2 ? y : C
            });
          }
        }
        for (var ae = 0; ae < Sr.length; ae++) {
          var ie = Sr[ae], P = ie._seqIndices, Ke = ie._sosType, we = ie._eosType, pe = le[P[0]] & 1 ? y : C;
          if (ce.get(he))
            for (var Ue = 0; Ue < P.length; Ue++) {
              var Oe = P[Ue];
              if (q[Oe] & he) {
                for (var He = Ke, Ve = Ue - 1; Ve >= 0; Ve--)
                  if (!(q[P[Ve]] & a)) {
                    He = q[P[Ve]];
                    break;
                  }
                xe(Oe, He & (e | Y) ? H : He);
              }
            }
          if (ce.get(M))
            for (var or = 0; or < P.length; or++) {
              var vr = P[or];
              if (q[vr] & M)
                for (var je = or - 1; je >= -1; je--) {
                  var Mr = je === -1 ? Ke : q[P[je]];
                  if (Mr & n) {
                    Mr === Z && xe(vr, x);
                    break;
                  }
                }
            }
          if (ce.get(Z))
            for (var qe = 0; qe < P.length; qe++) {
              var lr = P[qe];
              q[lr] & Z && xe(lr, y);
            }
          if (ce.get(L) || ce.get(R))
            for (var mr = 1; mr < P.length - 1; mr++) {
              var Gr = P[mr];
              if (q[Gr] & (L | R)) {
                for (var cr = 0, Xe = 0, ur = mr - 1; ur >= 0 && (cr = q[P[ur]], !!(cr & a)); ur--)
                  ;
                for (var $e = mr + 1; $e < P.length && (Xe = q[P[$e]], !!(Xe & a)); $e++)
                  ;
                cr === Xe && (q[Gr] === L ? cr === M : cr & (M | x)) && xe(Gr, cr);
              }
            }
          if (ce.get(M))
            for (var Le = 0; Le < P.length; Le++) {
              var _r = P[Le];
              if (q[_r] & M) {
                for (var Cr = Le - 1; Cr >= 0 && q[P[Cr]] & (ee | a); Cr--)
                  xe(P[Cr], M);
                for (Le++; Le < P.length && q[P[Le]] & (ee | a | M); Le++)
                  q[P[Le]] !== M && xe(P[Le], M);
              }
            }
          if (ce.get(ee) || ce.get(L) || ce.get(R))
            for (var fr = 0; fr < P.length; fr++) {
              var Rr = P[fr];
              if (q[Rr] & (ee | L | R)) {
                xe(Rr, H);
                for (var Tt = fr - 1; Tt >= 0 && q[P[Tt]] & a; Tt--)
                  xe(P[Tt], H);
                for (var Ut = fr + 1; Ut < P.length && q[P[Ut]] & a; Ut++)
                  xe(P[Ut], H);
              }
            }
          if (ce.get(M))
            for (var qt = 0, Hn = Ke; qt < P.length; qt++) {
              var Vn = P[qt], Jt = q[Vn];
              Jt & M ? Hn === C && xe(Vn, C) : Jt & n && (Hn = Jt);
            }
          if (ce.get(s)) {
            var at = y | M | x, jn = at | C, Ct = [];
            {
              for (var Jr = [], Qr = 0; Qr < P.length; Qr++)
                if (q[P[Qr]] & s) {
                  var ot = te[P[Qr]], Xn = void 0;
                  if (T(ot) !== null)
                    if (Jr.length < 63)
                      Jr.push({ char: ot, seqIndex: Qr });
                    else
                      break;
                  else if ((Xn = U(ot)) !== null)
                    for (var it = Jr.length - 1; it >= 0; it--) {
                      var Qt = Jr[it].char;
                      if (Qt === Xn || Qt === U(O(ot)) || T(O(Qt)) === ot) {
                        Ct.push([Jr[it].seqIndex, Qr]), Jr.length = it;
                        break;
                      }
                    }
                }
              Ct.sort(function(wr, Ir) {
                return wr[0] - Ir[0];
              });
            }
            for (var $t = 0; $t < Ct.length; $t++) {
              for (var Zn = Ct[$t], At = Zn[0], en = Zn[1], Yn = !1, Dr = 0, rn = At + 1; rn < en; rn++) {
                var Kn = P[rn];
                if (q[Kn] & jn) {
                  Yn = !0;
                  var qn = q[Kn] & at ? y : C;
                  if (qn === pe) {
                    Dr = qn;
                    break;
                  }
                }
              }
              if (Yn && !Dr) {
                Dr = Ke;
                for (var tn = At - 1; tn >= 0; tn--) {
                  var Jn = P[tn];
                  if (q[Jn] & jn) {
                    var Qn = q[Jn] & at ? y : C;
                    Qn !== pe ? Dr = Qn : Dr = pe;
                    break;
                  }
                }
              }
              if (Dr) {
                if (q[P[At]] = q[P[en]] = Dr, Dr !== pe) {
                  for (var st = At + 1; st < P.length; st++)
                    if (!(q[P[st]] & a)) {
                      d(te[P[st]]) & he && (q[P[st]] = Dr);
                      break;
                    }
                }
                if (Dr !== pe) {
                  for (var lt = en + 1; lt < P.length; lt++)
                    if (!(q[P[lt]] & a)) {
                      d(te[P[lt]]) & he && (q[P[lt]] = Dr);
                      break;
                    }
                }
              }
            }
            for (var Wr = 0; Wr < P.length; Wr++)
              if (q[P[Wr]] & s) {
                for (var $n = Wr, nn = Wr, an = Ke, ut = Wr - 1; ut >= 0; ut--)
                  if (q[P[ut]] & a)
                    $n = ut;
                  else {
                    an = q[P[ut]] & at ? y : C;
                    break;
                  }
                for (var ea = we, ct = Wr + 1; ct < P.length; ct++)
                  if (q[P[ct]] & (s | a))
                    nn = ct;
                  else {
                    ea = q[P[ct]] & at ? y : C;
                    break;
                  }
                for (var on = $n; on <= nn; on++)
                  q[P[on]] = an === ea ? an : pe;
                Wr = nn;
              }
          }
        }
        for (var Tr = _e.start; Tr <= _e.end; Tr++) {
          var Mo = le[Tr], Ft = q[Tr];
          if (Mo & 1 ? Ft & (C | M | x) && le[Tr]++ : Ft & y ? le[Tr]++ : Ft & (x | M) && (le[Tr] += 2), Ft & a && (le[Tr] = Tr === 0 ? _e.level : le[Tr - 1]), Tr === _e.end || d(te[Tr]) & (K | b))
            for (var kt = Tr; kt >= 0 && d(te[kt]) & i; kt--)
              le[kt] = _e.level;
        }
      }
      return {
        levels: le,
        paragraphs: ye
      };
      function ra(wr, Ir) {
        for (var xr = wr; xr < te.length; xr++) {
          var Hr = q[xr];
          if (Hr & (y | Z))
            return 1;
          if (Hr & (b | C) || Ir && Hr === Y)
            return 0;
          if (Hr & e) {
            var ta = To(xr);
            xr = ta === -1 ? te.length : ta;
          }
        }
        return 0;
      }
      function To(wr) {
        for (var Ir = 1, xr = wr + 1; xr < te.length; xr++) {
          var Hr = q[xr];
          if (Hr & b)
            break;
          if (Hr & Y) {
            if (--Ir === 0)
              return xr;
          } else Hr & e && Ir++;
        }
        return -1;
      }
    }
    var ve = "14>1,j>2,t>2,u>2,1a>g,2v3>1,1>1,1ge>1,1wd>1,b>1,1j>1,f>1,ai>3,-2>3,+1,8>1k0,-1jq>1y7,-1y6>1hf,-1he>1h6,-1h5>1ha,-1h8>1qi,-1pu>1,6>3u,-3s>7,6>1,1>1,f>1,1>1,+2,3>1,1>1,+13,4>1,1>1,6>1eo,-1ee>1,3>1mg,-1me>1mk,-1mj>1mi,-1mg>1mi,-1md>1,1>1,+2,1>10k,-103>1,1>1,4>1,5>1,1>1,+10,3>1,1>8,-7>8,+1,-6>7,+1,a>1,1>1,u>1,u6>1,1>1,+5,26>1,1>1,2>1,2>2,8>1,7>1,4>1,1>1,+5,b8>1,1>1,+3,1>3,-2>1,2>1,1>1,+2,c>1,3>1,1>1,+2,h>1,3>1,a>1,1>1,2>1,3>1,1>1,d>1,f>1,3>1,1a>1,1>1,6>1,7>1,13>1,k>1,1>1,+19,4>1,1>1,+2,2>1,1>1,+18,m>1,a>1,1>1,lk>1,1>1,4>1,2>1,f>1,3>1,1>1,+3,db>1,1>1,+3,3>1,1>1,+2,14qm>1,1>1,+1,6>1,4j>1,j>2,t>2,u>2,2>1,+1", oe;
    function $() {
      if (!oe) {
        var te = S(ve, !0), me = te.map, de = te.reverseMap;
        de.forEach(function(q, Ae) {
          me.set(Ae, q);
        }), oe = me;
      }
    }
    function Fe(te) {
      return $(), oe.get(te) || null;
    }
    function Te(te, me, de, q) {
      var Ae = te.length;
      de = Math.max(0, de == null ? 0 : +de), q = Math.min(Ae - 1, q == null ? Ae - 1 : +q);
      for (var ce = /* @__PURE__ */ new Map(), xe = de; xe <= q; xe++)
        if (me[xe] & 1) {
          var le = Fe(te[xe]);
          le !== null && ce.set(xe, le);
        }
      return ce;
    }
    function fe(te, me, de, q) {
      var Ae = te.length;
      de = Math.max(0, de == null ? 0 : +de), q = Math.min(Ae - 1, q == null ? Ae - 1 : +q);
      var ce = [];
      return me.paragraphs.forEach(function(xe) {
        var le = Math.max(de, xe.start), ze = Math.min(q, xe.end);
        if (le < ze) {
          for (var ye = me.levels.slice(le, ze + 1), _e = ze; _e >= le && d(te[_e]) & i; _e--)
            ye[_e] = xe.level;
          for (var Se = xe.level, ke = 1 / 0, Je = 0; Je < ye.length; Je++) {
            var tr = ye[Je];
            tr > Se && (Se = tr), tr < ke && (ke = tr | 1);
          }
          for (var Re = Se; Re >= ke; Re--)
            for (var Me = 0; Me < ye.length; Me++)
              if (ye[Me] >= Re) {
                for (var be = Me; Me + 1 < ye.length && ye[Me + 1] >= Re; )
                  Me++;
                Me > be && ce.push([be + le, Me + le]);
              }
        }
      }), ce;
    }
    function ge(te, me, de, q) {
      var Ae = Ee(te, me, de, q), ce = [].concat(te);
      return Ae.forEach(function(xe, le) {
        ce[le] = (me.levels[xe] & 1 ? Fe(te[xe]) : null) || te[xe];
      }), ce.join("");
    }
    function Ee(te, me, de, q) {
      for (var Ae = fe(te, me, de, q), ce = [], xe = 0; xe < te.length; xe++)
        ce[xe] = xe;
      return Ae.forEach(function(le) {
        for (var ze = le[0], ye = le[1], _e = ce.slice(ze, ye + 1), Se = _e.length; Se--; )
          ce[ye - Se] = _e[Se];
      }), ce;
    }
    return r.closingToOpeningBracket = U, r.getBidiCharType = d, r.getBidiCharTypeName = p, r.getCanonicalBracket = O, r.getEmbeddingLevels = ue, r.getMirroredCharacter = Fe, r.getMirroredCharactersMap = Te, r.getReorderSegments = fe, r.getReorderedIndices = Ee, r.getReorderedString = ge, r.openingToClosingBracket = T, Object.defineProperty(r, "__esModule", { value: !0 }), r;
  })({});
  return o;
}
const $a = /\bvoid\s+main\s*\(\s*\)\s*{/g;
function _n(o) {
  const r = /^[ \t]*#include +<([\w\d./]+)>/gm;
  function u(c, t) {
    let e = Uo[t];
    return e ? _n(e) : c;
  }
  return o.replace(r, u);
}
const gr = [];
for (let o = 0; o < 256; o++)
  gr[o] = (o < 16 ? "0" : "") + o.toString(16);
function rs() {
  const o = Math.random() * 4294967295 | 0, r = Math.random() * 4294967295 | 0, u = Math.random() * 4294967295 | 0, c = Math.random() * 4294967295 | 0;
  return (gr[o & 255] + gr[o >> 8 & 255] + gr[o >> 16 & 255] + gr[o >> 24 & 255] + "-" + gr[r & 255] + gr[r >> 8 & 255] + "-" + gr[r >> 16 & 15 | 64] + gr[r >> 24 & 255] + "-" + gr[u & 63 | 128] + gr[u >> 8 & 255] + "-" + gr[u >> 16 & 255] + gr[u >> 24 & 255] + gr[c & 255] + gr[c >> 8 & 255] + gr[c >> 16 & 255] + gr[c >> 24 & 255]).toUpperCase();
}
const Zr = Object.assign || function() {
  let o = arguments[0];
  for (let r = 1, u = arguments.length; r < u; r++) {
    let c = arguments[r];
    if (c)
      for (let t in c)
        Object.prototype.hasOwnProperty.call(c, t) && (o[t] = c[t]);
  }
  return o;
}, ts = Date.now(), la = /* @__PURE__ */ new WeakMap(), ua = /* @__PURE__ */ new Map();
let ns = 1e10;
function wn(o, r) {
  const u = ss(r);
  let c = la.get(o);
  if (c || la.set(o, c = /* @__PURE__ */ Object.create(null)), c[u])
    return new c[u]();
  const t = `_onBeforeCompile${u}`, e = function(i, l) {
    o.onBeforeCompile.call(this, i, l);
    const h = this.customProgramCacheKey() + "|" + i.vertexShader + "|" + i.fragmentShader;
    let d = ua[h];
    if (!d) {
      const p = as(this, i, r, u);
      d = ua[h] = p;
    }
    i.vertexShader = d.vertexShader, i.fragmentShader = d.fragmentShader, Zr(i.uniforms, this.uniforms), r.timeUniform && (i.uniforms[r.timeUniform] = {
      get value() {
        return Date.now() - ts;
      }
    }), this[t] && this[t](i);
  }, n = function() {
    return s(r.chained ? o : o.clone());
  }, s = function(i) {
    const l = Object.create(i, a);
    return Object.defineProperty(l, "baseMaterial", { value: o }), Object.defineProperty(l, "id", { value: ns++ }), l.uuid = rs(), l.uniforms = Zr({}, i.uniforms, r.uniforms), l.defines = Zr({}, i.defines, r.defines), l.defines[`TROIKA_DERIVED_MATERIAL_${u}`] = "", l.extensions = Zr({}, i.extensions, r.extensions), l._listeners = void 0, l;
  }, a = {
    constructor: { value: n },
    isDerivedMaterial: { value: !0 },
    type: {
      get: () => o.type,
      set: (i) => {
        o.type = i;
      }
    },
    isDerivedFrom: {
      writable: !0,
      configurable: !0,
      value: function(i) {
        const l = this.baseMaterial;
        return i === l || l.isDerivedMaterial && l.isDerivedFrom(i) || !1;
      }
    },
    customProgramCacheKey: {
      writable: !0,
      configurable: !0,
      value: function() {
        return o.customProgramCacheKey() + "|" + u;
      }
    },
    onBeforeCompile: {
      get() {
        return e;
      },
      set(i) {
        this[t] = i;
      }
    },
    copy: {
      writable: !0,
      configurable: !0,
      value: function(i) {
        return o.copy.call(this, i), !o.isShaderMaterial && !o.isDerivedMaterial && (Zr(this.extensions, i.extensions), Zr(this.defines, i.defines), Zr(this.uniforms, Aa.clone(i.uniforms))), this;
      }
    },
    clone: {
      writable: !0,
      configurable: !0,
      value: function() {
        const i = new o.constructor();
        return s(i).copy(this);
      }
    },
    /**
     * Utility to get a MeshDepthMaterial that will honor this derived material's vertex
     * transformations and discarded fragments.
     */
    getDepthMaterial: {
      writable: !0,
      configurable: !0,
      value: function() {
        let i = this._depthMaterial;
        return i || (i = this._depthMaterial = wn(
          o.isDerivedMaterial ? o.getDepthMaterial() : new Io({ depthPacking: Oo }),
          r
        ), i.defines.IS_DEPTH_MATERIAL = "", i.uniforms = this.uniforms), i;
      }
    },
    /**
     * Utility to get a MeshDistanceMaterial that will honor this derived material's vertex
     * transformations and discarded fragments.
     */
    getDistanceMaterial: {
      writable: !0,
      configurable: !0,
      value: function() {
        let i = this._distanceMaterial;
        return i || (i = this._distanceMaterial = wn(
          o.isDerivedMaterial ? o.getDistanceMaterial() : new Do(),
          r
        ), i.defines.IS_DISTANCE_MATERIAL = "", i.uniforms = this.uniforms), i;
      }
    },
    dispose: {
      writable: !0,
      configurable: !0,
      value() {
        const { _depthMaterial: i, _distanceMaterial: l } = this;
        i && i.dispose(), l && l.dispose(), o.dispose.call(this);
      }
    }
  };
  return c[u] = n, new n();
}
function as(o, { vertexShader: r, fragmentShader: u }, c, t) {
  let {
    vertexDefs: e,
    vertexMainIntro: n,
    vertexMainOutro: s,
    vertexTransform: a,
    fragmentDefs: i,
    fragmentMainIntro: l,
    fragmentMainOutro: h,
    fragmentColorTransform: d,
    customRewriter: p,
    timeUniform: g
  } = c;
  if (e = e || "", n = n || "", s = s || "", i = i || "", l = l || "", h = h || "", (a || p) && (r = _n(r)), (d || p) && (u = u.replace(
    /^[ \t]*#include <((?:tonemapping|encodings|colorspace|fog|premultiplied_alpha|dithering)_fragment)>/gm,
    `
//!BEGIN_POST_CHUNK $1
$&
//!END_POST_CHUNK
`
  ), u = _n(u)), p) {
    let S = p({ vertexShader: r, fragmentShader: u });
    r = S.vertexShader, u = S.fragmentShader;
  }
  if (d) {
    let S = [];
    u = u.replace(
      /^\/\/!BEGIN_POST_CHUNK[^]+?^\/\/!END_POST_CHUNK/gm,
      // [^]+? = non-greedy match of any chars including newlines
      (w) => (S.push(w), "")
    ), h = `${d}
${S.join(`
`)}
${h}`;
  }
  if (g) {
    const S = `
uniform float ${g};
`;
    e = S + e, i = S + i;
  }
  return a && (r = `vec3 troika_position_${t};
vec3 troika_normal_${t};
vec2 troika_uv_${t};
${r}
`, e = `${e}
void troikaVertexTransform${t}(inout vec3 position, inout vec3 normal, inout vec2 uv) {
  ${a}
}
`, n = `
troika_position_${t} = vec3(position);
troika_normal_${t} = vec3(normal);
troika_uv_${t} = vec2(uv);
troikaVertexTransform${t}(troika_position_${t}, troika_normal_${t}, troika_uv_${t});
${n}
`, r = r.replace(/\b(position|normal|uv)\b/g, (S, w, I, A) => /\battribute\s+vec[23]\s+$/.test(A.substr(0, I)) ? w : `troika_${w}_${t}`), o.map && o.map.channel > 0 || (r = r.replace(/\bMAP_UV\b/g, `troika_uv_${t}`))), r = ca(r, t, e, n, s), u = ca(u, t, i, l, h), {
    vertexShader: r,
    fragmentShader: u
  };
}
function ca(o, r, u, c, t) {
  return (c || t || u) && (o = o.replace(
    $a,
    `
${u}
void troikaOrigMain${r}() {`
  ), o += `
void main() {
  ${c}
  troikaOrigMain${r}();
  ${t}
}`), o;
}
function os(o, r) {
  return o === "uniforms" ? void 0 : typeof r == "function" ? r.toString() : r;
}
let is = 0;
const fa = /* @__PURE__ */ new Map();
function ss(o) {
  const r = JSON.stringify(o, os);
  let u = fa.get(r);
  return u == null && fa.set(r, u = ++is), u;
}
function ls() {
  return typeof window > "u" && (self.window = self), (function(o) {
    var r = { parse: function(t) {
      var e = r._bin, n = new Uint8Array(t);
      if (e.readASCII(n, 0, 4) == "ttcf") {
        var s = 4;
        e.readUshort(n, s), s += 2, e.readUshort(n, s), s += 2;
        var a = e.readUint(n, s);
        s += 4;
        for (var i = [], l = 0; l < a; l++) {
          var h = e.readUint(n, s);
          s += 4, i.push(r._readFont(n, h));
        }
        return i;
      }
      return [r._readFont(n, 0)];
    }, _readFont: function(t, e) {
      var n = r._bin, s = e;
      n.readFixed(t, e), e += 4;
      var a = n.readUshort(t, e);
      e += 2, n.readUshort(t, e), e += 2, n.readUshort(t, e), e += 2, n.readUshort(t, e), e += 2;
      for (var i = ["cmap", "head", "hhea", "maxp", "hmtx", "name", "OS/2", "post", "loca", "glyf", "kern", "CFF ", "GDEF", "GPOS", "GSUB", "SVG "], l = { _data: t, _offset: s }, h = {}, d = 0; d < a; d++) {
        var p = n.readASCII(t, e, 4);
        e += 4, n.readUint(t, e), e += 4;
        var g = n.readUint(t, e);
        e += 4;
        var S = n.readUint(t, e);
        e += 4, h[p] = { offset: g, length: S };
      }
      for (d = 0; d < i.length; d++) {
        var w = i[d];
        h[w] && (l[w.trim()] = r[w.trim()].parse(t, h[w].offset, h[w].length, l));
      }
      return l;
    }, _tabOffset: function(t, e, n) {
      for (var s = r._bin, a = s.readUshort(t, n + 4), i = n + 12, l = 0; l < a; l++) {
        var h = s.readASCII(t, i, 4);
        i += 4, s.readUint(t, i), i += 4;
        var d = s.readUint(t, i);
        if (i += 4, s.readUint(t, i), i += 4, h == e) return d;
      }
      return 0;
    } };
    r._bin = { readFixed: function(t, e) {
      return (t[e] << 8 | t[e + 1]) + (t[e + 2] << 8 | t[e + 3]) / 65540;
    }, readF2dot14: function(t, e) {
      return r._bin.readShort(t, e) / 16384;
    }, readInt: function(t, e) {
      return r._bin._view(t).getInt32(e);
    }, readInt8: function(t, e) {
      return r._bin._view(t).getInt8(e);
    }, readShort: function(t, e) {
      return r._bin._view(t).getInt16(e);
    }, readUshort: function(t, e) {
      return r._bin._view(t).getUint16(e);
    }, readUshorts: function(t, e, n) {
      for (var s = [], a = 0; a < n; a++) s.push(r._bin.readUshort(t, e + 2 * a));
      return s;
    }, readUint: function(t, e) {
      return r._bin._view(t).getUint32(e);
    }, readUint64: function(t, e) {
      return 4294967296 * r._bin.readUint(t, e) + r._bin.readUint(t, e + 4);
    }, readASCII: function(t, e, n) {
      for (var s = "", a = 0; a < n; a++) s += String.fromCharCode(t[e + a]);
      return s;
    }, readUnicode: function(t, e, n) {
      for (var s = "", a = 0; a < n; a++) {
        var i = t[e++] << 8 | t[e++];
        s += String.fromCharCode(i);
      }
      return s;
    }, _tdec: typeof window < "u" && window.TextDecoder ? new window.TextDecoder() : null, readUTF8: function(t, e, n) {
      var s = r._bin._tdec;
      return s && e == 0 && n == t.length ? s.decode(t) : r._bin.readASCII(t, e, n);
    }, readBytes: function(t, e, n) {
      for (var s = [], a = 0; a < n; a++) s.push(t[e + a]);
      return s;
    }, readASCIIArray: function(t, e, n) {
      for (var s = [], a = 0; a < n; a++) s.push(String.fromCharCode(t[e + a]));
      return s;
    }, _view: function(t) {
      return t._dataView || (t._dataView = t.buffer ? new DataView(t.buffer, t.byteOffset, t.byteLength) : new DataView(new Uint8Array(t).buffer));
    } }, r._lctf = {}, r._lctf.parse = function(t, e, n, s, a) {
      var i = r._bin, l = {}, h = e;
      i.readFixed(t, e), e += 4;
      var d = i.readUshort(t, e);
      e += 2;
      var p = i.readUshort(t, e);
      e += 2;
      var g = i.readUshort(t, e);
      return e += 2, l.scriptList = r._lctf.readScriptList(t, h + d), l.featureList = r._lctf.readFeatureList(t, h + p), l.lookupList = r._lctf.readLookupList(t, h + g, a), l;
    }, r._lctf.readLookupList = function(t, e, n) {
      var s = r._bin, a = e, i = [], l = s.readUshort(t, e);
      e += 2;
      for (var h = 0; h < l; h++) {
        var d = s.readUshort(t, e);
        e += 2;
        var p = r._lctf.readLookupTable(t, a + d, n);
        i.push(p);
      }
      return i;
    }, r._lctf.readLookupTable = function(t, e, n) {
      var s = r._bin, a = e, i = { tabs: [] };
      i.ltype = s.readUshort(t, e), e += 2, i.flag = s.readUshort(t, e), e += 2;
      var l = s.readUshort(t, e);
      e += 2;
      for (var h = i.ltype, d = 0; d < l; d++) {
        var p = s.readUshort(t, e);
        e += 2;
        var g = n(t, h, a + p, i);
        i.tabs.push(g);
      }
      return i;
    }, r._lctf.numOfOnes = function(t) {
      for (var e = 0, n = 0; n < 32; n++) (t >>> n & 1) != 0 && e++;
      return e;
    }, r._lctf.readClassDef = function(t, e) {
      var n = r._bin, s = [], a = n.readUshort(t, e);
      if (e += 2, a == 1) {
        var i = n.readUshort(t, e);
        e += 2;
        var l = n.readUshort(t, e);
        e += 2;
        for (var h = 0; h < l; h++) s.push(i + h), s.push(i + h), s.push(n.readUshort(t, e)), e += 2;
      }
      if (a == 2) {
        var d = n.readUshort(t, e);
        for (e += 2, h = 0; h < d; h++) s.push(n.readUshort(t, e)), e += 2, s.push(n.readUshort(t, e)), e += 2, s.push(n.readUshort(t, e)), e += 2;
      }
      return s;
    }, r._lctf.getInterval = function(t, e) {
      for (var n = 0; n < t.length; n += 3) {
        var s = t[n], a = t[n + 1];
        if (t[n + 2], s <= e && e <= a) return n;
      }
      return -1;
    }, r._lctf.readCoverage = function(t, e) {
      var n = r._bin, s = {};
      s.fmt = n.readUshort(t, e), e += 2;
      var a = n.readUshort(t, e);
      return e += 2, s.fmt == 1 && (s.tab = n.readUshorts(t, e, a)), s.fmt == 2 && (s.tab = n.readUshorts(t, e, 3 * a)), s;
    }, r._lctf.coverageIndex = function(t, e) {
      var n = t.tab;
      if (t.fmt == 1) return n.indexOf(e);
      if (t.fmt == 2) {
        var s = r._lctf.getInterval(n, e);
        if (s != -1) return n[s + 2] + (e - n[s]);
      }
      return -1;
    }, r._lctf.readFeatureList = function(t, e) {
      var n = r._bin, s = e, a = [], i = n.readUshort(t, e);
      e += 2;
      for (var l = 0; l < i; l++) {
        var h = n.readASCII(t, e, 4);
        e += 4;
        var d = n.readUshort(t, e);
        e += 2;
        var p = r._lctf.readFeatureTable(t, s + d);
        p.tag = h.trim(), a.push(p);
      }
      return a;
    }, r._lctf.readFeatureTable = function(t, e) {
      var n = r._bin, s = e, a = {}, i = n.readUshort(t, e);
      e += 2, i > 0 && (a.featureParams = s + i);
      var l = n.readUshort(t, e);
      e += 2, a.tab = [];
      for (var h = 0; h < l; h++) a.tab.push(n.readUshort(t, e + 2 * h));
      return a;
    }, r._lctf.readScriptList = function(t, e) {
      var n = r._bin, s = e, a = {}, i = n.readUshort(t, e);
      e += 2;
      for (var l = 0; l < i; l++) {
        var h = n.readASCII(t, e, 4);
        e += 4;
        var d = n.readUshort(t, e);
        e += 2, a[h.trim()] = r._lctf.readScriptTable(t, s + d);
      }
      return a;
    }, r._lctf.readScriptTable = function(t, e) {
      var n = r._bin, s = e, a = {}, i = n.readUshort(t, e);
      e += 2, i > 0 && (a.default = r._lctf.readLangSysTable(t, s + i));
      var l = n.readUshort(t, e);
      e += 2;
      for (var h = 0; h < l; h++) {
        var d = n.readASCII(t, e, 4);
        e += 4;
        var p = n.readUshort(t, e);
        e += 2, a[d.trim()] = r._lctf.readLangSysTable(t, s + p);
      }
      return a;
    }, r._lctf.readLangSysTable = function(t, e) {
      var n = r._bin, s = {};
      n.readUshort(t, e), e += 2, s.reqFeature = n.readUshort(t, e), e += 2;
      var a = n.readUshort(t, e);
      return e += 2, s.features = n.readUshorts(t, e, a), s;
    }, r.CFF = {}, r.CFF.parse = function(t, e, n) {
      var s = r._bin;
      (t = new Uint8Array(t.buffer, e, n))[e = 0], t[++e], t[++e], t[++e], e++;
      var a = [];
      e = r.CFF.readIndex(t, e, a);
      for (var i = [], l = 0; l < a.length - 1; l++) i.push(s.readASCII(t, e + a[l], a[l + 1] - a[l]));
      e += a[a.length - 1];
      var h = [];
      e = r.CFF.readIndex(t, e, h);
      var d = [];
      for (l = 0; l < h.length - 1; l++) d.push(r.CFF.readDict(t, e + h[l], e + h[l + 1]));
      e += h[h.length - 1];
      var p = d[0], g = [];
      e = r.CFF.readIndex(t, e, g);
      var S = [];
      for (l = 0; l < g.length - 1; l++) S.push(s.readASCII(t, e + g[l], g[l + 1] - g[l]));
      if (e += g[g.length - 1], r.CFF.readSubrs(t, e, p), p.CharStrings) {
        e = p.CharStrings, g = [], e = r.CFF.readIndex(t, e, g);
        var w = [];
        for (l = 0; l < g.length - 1; l++) w.push(s.readBytes(t, e + g[l], g[l + 1] - g[l]));
        p.CharStrings = w;
      }
      if (p.ROS) {
        e = p.FDArray;
        var I = [];
        for (e = r.CFF.readIndex(t, e, I), p.FDArray = [], l = 0; l < I.length - 1; l++) {
          var A = r.CFF.readDict(t, e + I[l], e + I[l + 1]);
          r.CFF._readFDict(t, A, S), p.FDArray.push(A);
        }
        e += I[I.length - 1], e = p.FDSelect, p.FDSelect = [];
        var k = t[e];
        if (e++, k != 3) throw k;
        var T = s.readUshort(t, e);
        for (e += 2, l = 0; l < T + 1; l++) p.FDSelect.push(s.readUshort(t, e), t[e + 2]), e += 3;
      }
      return p.Encoding && (p.Encoding = r.CFF.readEncoding(t, p.Encoding, p.CharStrings.length)), p.charset && (p.charset = r.CFF.readCharset(t, p.charset, p.CharStrings.length)), r.CFF._readFDict(t, p, S), p;
    }, r.CFF._readFDict = function(t, e, n) {
      var s;
      for (var a in e.Private && (s = e.Private[1], e.Private = r.CFF.readDict(t, s, s + e.Private[0]), e.Private.Subrs && r.CFF.readSubrs(t, s + e.Private.Subrs, e.Private)), e) ["FamilyName", "FontName", "FullName", "Notice", "version", "Copyright"].indexOf(a) != -1 && (e[a] = n[e[a] - 426 + 35]);
    }, r.CFF.readSubrs = function(t, e, n) {
      var s = r._bin, a = [];
      e = r.CFF.readIndex(t, e, a);
      var i, l = a.length;
      i = l < 1240 ? 107 : l < 33900 ? 1131 : 32768, n.Bias = i, n.Subrs = [];
      for (var h = 0; h < a.length - 1; h++) n.Subrs.push(s.readBytes(t, e + a[h], a[h + 1] - a[h]));
    }, r.CFF.tableSE = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 0, 111, 112, 113, 114, 0, 115, 116, 117, 118, 119, 120, 121, 122, 0, 123, 0, 124, 125, 126, 127, 128, 129, 130, 131, 0, 132, 133, 0, 134, 135, 136, 137, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 138, 0, 139, 0, 0, 0, 0, 140, 141, 142, 143, 0, 0, 0, 0, 0, 144, 0, 0, 0, 145, 0, 0, 146, 147, 148, 149, 0, 0, 0, 0], r.CFF.glyphByUnicode = function(t, e) {
      for (var n = 0; n < t.charset.length; n++) if (t.charset[n] == e) return n;
      return -1;
    }, r.CFF.glyphBySE = function(t, e) {
      return e < 0 || e > 255 ? -1 : r.CFF.glyphByUnicode(t, r.CFF.tableSE[e]);
    }, r.CFF.readEncoding = function(t, e, n) {
      r._bin;
      var s = [".notdef"], a = t[e];
      if (e++, a != 0) throw "error: unknown encoding format: " + a;
      var i = t[e];
      e++;
      for (var l = 0; l < i; l++) s.push(t[e + l]);
      return s;
    }, r.CFF.readCharset = function(t, e, n) {
      var s = r._bin, a = [".notdef"], i = t[e];
      if (e++, i == 0) for (var l = 0; l < n; l++) {
        var h = s.readUshort(t, e);
        e += 2, a.push(h);
      }
      else {
        if (i != 1 && i != 2) throw "error: format: " + i;
        for (; a.length < n; ) {
          h = s.readUshort(t, e), e += 2;
          var d = 0;
          for (i == 1 ? (d = t[e], e++) : (d = s.readUshort(t, e), e += 2), l = 0; l <= d; l++) a.push(h), h++;
        }
      }
      return a;
    }, r.CFF.readIndex = function(t, e, n) {
      var s = r._bin, a = s.readUshort(t, e) + 1, i = t[e += 2];
      if (e++, i == 1) for (var l = 0; l < a; l++) n.push(t[e + l]);
      else if (i == 2) for (l = 0; l < a; l++) n.push(s.readUshort(t, e + 2 * l));
      else if (i == 3) for (l = 0; l < a; l++) n.push(16777215 & s.readUint(t, e + 3 * l - 1));
      else if (a != 1) throw "unsupported offset size: " + i + ", count: " + a;
      return (e += a * i) - 1;
    }, r.CFF.getCharString = function(t, e, n) {
      var s = r._bin, a = t[e], i = t[e + 1];
      t[e + 2], t[e + 3], t[e + 4];
      var l = 1, h = null, d = null;
      a <= 20 && (h = a, l = 1), a == 12 && (h = 100 * a + i, l = 2), 21 <= a && a <= 27 && (h = a, l = 1), a == 28 && (d = s.readShort(t, e + 1), l = 3), 29 <= a && a <= 31 && (h = a, l = 1), 32 <= a && a <= 246 && (d = a - 139, l = 1), 247 <= a && a <= 250 && (d = 256 * (a - 247) + i + 108, l = 2), 251 <= a && a <= 254 && (d = 256 * -(a - 251) - i - 108, l = 2), a == 255 && (d = s.readInt(t, e + 1) / 65535, l = 5), n.val = d ?? "o" + h, n.size = l;
    }, r.CFF.readCharString = function(t, e, n) {
      for (var s = e + n, a = r._bin, i = []; e < s; ) {
        var l = t[e], h = t[e + 1];
        t[e + 2], t[e + 3], t[e + 4];
        var d = 1, p = null, g = null;
        l <= 20 && (p = l, d = 1), l == 12 && (p = 100 * l + h, d = 2), l != 19 && l != 20 || (p = l, d = 2), 21 <= l && l <= 27 && (p = l, d = 1), l == 28 && (g = a.readShort(t, e + 1), d = 3), 29 <= l && l <= 31 && (p = l, d = 1), 32 <= l && l <= 246 && (g = l - 139, d = 1), 247 <= l && l <= 250 && (g = 256 * (l - 247) + h + 108, d = 2), 251 <= l && l <= 254 && (g = 256 * -(l - 251) - h - 108, d = 2), l == 255 && (g = a.readInt(t, e + 1) / 65535, d = 5), i.push(g ?? "o" + p), e += d;
      }
      return i;
    }, r.CFF.readDict = function(t, e, n) {
      for (var s = r._bin, a = {}, i = []; e < n; ) {
        var l = t[e], h = t[e + 1];
        t[e + 2], t[e + 3], t[e + 4];
        var d = 1, p = null, g = null;
        if (l == 28 && (g = s.readShort(t, e + 1), d = 3), l == 29 && (g = s.readInt(t, e + 1), d = 5), 32 <= l && l <= 246 && (g = l - 139, d = 1), 247 <= l && l <= 250 && (g = 256 * (l - 247) + h + 108, d = 2), 251 <= l && l <= 254 && (g = 256 * -(l - 251) - h - 108, d = 2), l == 255) throw g = s.readInt(t, e + 1) / 65535, d = 5, "unknown number";
        if (l == 30) {
          var S = [];
          for (d = 1; ; ) {
            var w = t[e + d];
            d++;
            var I = w >> 4, A = 15 & w;
            if (I != 15 && S.push(I), A != 15 && S.push(A), A == 15) break;
          }
          for (var k = "", T = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, ".", "e", "e-", "reserved", "-", "endOfNumber"], U = 0; U < S.length; U++) k += T[S[U]];
          g = parseFloat(k);
        }
        l <= 21 && (p = ["version", "Notice", "FullName", "FamilyName", "Weight", "FontBBox", "BlueValues", "OtherBlues", "FamilyBlues", "FamilyOtherBlues", "StdHW", "StdVW", "escape", "UniqueID", "XUID", "charset", "Encoding", "CharStrings", "Private", "Subrs", "defaultWidthX", "nominalWidthX"][l], d = 1, l == 12 && (p = ["Copyright", "isFixedPitch", "ItalicAngle", "UnderlinePosition", "UnderlineThickness", "PaintType", "CharstringType", "FontMatrix", "StrokeWidth", "BlueScale", "BlueShift", "BlueFuzz", "StemSnapH", "StemSnapV", "ForceBold", 0, 0, "LanguageGroup", "ExpansionFactor", "initialRandomSeed", "SyntheticBase", "PostScript", "BaseFontName", "BaseFontBlend", 0, 0, 0, 0, 0, 0, "ROS", "CIDFontVersion", "CIDFontRevision", "CIDFontType", "CIDCount", "UIDBase", "FDArray", "FDSelect", "FontName"][h], d = 2)), p != null ? (a[p] = i.length == 1 ? i[0] : i, i = []) : i.push(g), e += d;
      }
      return a;
    }, r.cmap = {}, r.cmap.parse = function(t, e, n) {
      t = new Uint8Array(t.buffer, e, n), e = 0;
      var s = r._bin, a = {};
      s.readUshort(t, e), e += 2;
      var i = s.readUshort(t, e);
      e += 2;
      var l = [];
      a.tables = [];
      for (var h = 0; h < i; h++) {
        var d = s.readUshort(t, e);
        e += 2;
        var p = s.readUshort(t, e);
        e += 2;
        var g = s.readUint(t, e);
        e += 4;
        var S = "p" + d + "e" + p, w = l.indexOf(g);
        if (w == -1) {
          var I;
          w = a.tables.length, l.push(g);
          var A = s.readUshort(t, g);
          A == 0 ? I = r.cmap.parse0(t, g) : A == 4 ? I = r.cmap.parse4(t, g) : A == 6 ? I = r.cmap.parse6(t, g) : A == 12 ? I = r.cmap.parse12(t, g) : console.debug("unknown format: " + A, d, p, g), a.tables.push(I);
        }
        if (a[S] != null) throw "multiple tables for one platform+encoding";
        a[S] = w;
      }
      return a;
    }, r.cmap.parse0 = function(t, e) {
      var n = r._bin, s = {};
      s.format = n.readUshort(t, e), e += 2;
      var a = n.readUshort(t, e);
      e += 2, n.readUshort(t, e), e += 2, s.map = [];
      for (var i = 0; i < a - 6; i++) s.map.push(t[e + i]);
      return s;
    }, r.cmap.parse4 = function(t, e) {
      var n = r._bin, s = e, a = {};
      a.format = n.readUshort(t, e), e += 2;
      var i = n.readUshort(t, e);
      e += 2, n.readUshort(t, e), e += 2;
      var l = n.readUshort(t, e);
      e += 2;
      var h = l / 2;
      a.searchRange = n.readUshort(t, e), e += 2, a.entrySelector = n.readUshort(t, e), e += 2, a.rangeShift = n.readUshort(t, e), e += 2, a.endCount = n.readUshorts(t, e, h), e += 2 * h, e += 2, a.startCount = n.readUshorts(t, e, h), e += 2 * h, a.idDelta = [];
      for (var d = 0; d < h; d++) a.idDelta.push(n.readShort(t, e)), e += 2;
      for (a.idRangeOffset = n.readUshorts(t, e, h), e += 2 * h, a.glyphIdArray = []; e < s + i; ) a.glyphIdArray.push(n.readUshort(t, e)), e += 2;
      return a;
    }, r.cmap.parse6 = function(t, e) {
      var n = r._bin, s = {};
      s.format = n.readUshort(t, e), e += 2, n.readUshort(t, e), e += 2, n.readUshort(t, e), e += 2, s.firstCode = n.readUshort(t, e), e += 2;
      var a = n.readUshort(t, e);
      e += 2, s.glyphIdArray = [];
      for (var i = 0; i < a; i++) s.glyphIdArray.push(n.readUshort(t, e)), e += 2;
      return s;
    }, r.cmap.parse12 = function(t, e) {
      var n = r._bin, s = {};
      s.format = n.readUshort(t, e), e += 2, e += 2, n.readUint(t, e), e += 4, n.readUint(t, e), e += 4;
      var a = n.readUint(t, e);
      e += 4, s.groups = [];
      for (var i = 0; i < a; i++) {
        var l = e + 12 * i, h = n.readUint(t, l + 0), d = n.readUint(t, l + 4), p = n.readUint(t, l + 8);
        s.groups.push([h, d, p]);
      }
      return s;
    }, r.glyf = {}, r.glyf.parse = function(t, e, n, s) {
      for (var a = [], i = 0; i < s.maxp.numGlyphs; i++) a.push(null);
      return a;
    }, r.glyf._parseGlyf = function(t, e) {
      var n = r._bin, s = t._data, a = r._tabOffset(s, "glyf", t._offset) + t.loca[e];
      if (t.loca[e] == t.loca[e + 1]) return null;
      var i = {};
      if (i.noc = n.readShort(s, a), a += 2, i.xMin = n.readShort(s, a), a += 2, i.yMin = n.readShort(s, a), a += 2, i.xMax = n.readShort(s, a), a += 2, i.yMax = n.readShort(s, a), a += 2, i.xMin >= i.xMax || i.yMin >= i.yMax) return null;
      if (i.noc > 0) {
        i.endPts = [];
        for (var l = 0; l < i.noc; l++) i.endPts.push(n.readUshort(s, a)), a += 2;
        var h = n.readUshort(s, a);
        if (a += 2, s.length - a < h) return null;
        i.instructions = n.readBytes(s, a, h), a += h;
        var d = i.endPts[i.noc - 1] + 1;
        for (i.flags = [], l = 0; l < d; l++) {
          var p = s[a];
          if (a++, i.flags.push(p), (8 & p) != 0) {
            var g = s[a];
            a++;
            for (var S = 0; S < g; S++) i.flags.push(p), l++;
          }
        }
        for (i.xs = [], l = 0; l < d; l++) {
          var w = (2 & i.flags[l]) != 0, I = (16 & i.flags[l]) != 0;
          w ? (i.xs.push(I ? s[a] : -s[a]), a++) : I ? i.xs.push(0) : (i.xs.push(n.readShort(s, a)), a += 2);
        }
        for (i.ys = [], l = 0; l < d; l++)
          w = (4 & i.flags[l]) != 0, I = (32 & i.flags[l]) != 0, w ? (i.ys.push(I ? s[a] : -s[a]), a++) : I ? i.ys.push(0) : (i.ys.push(n.readShort(s, a)), a += 2);
        var A = 0, k = 0;
        for (l = 0; l < d; l++) A += i.xs[l], k += i.ys[l], i.xs[l] = A, i.ys[l] = k;
      } else {
        var T;
        i.parts = [];
        do {
          T = n.readUshort(s, a), a += 2;
          var U = { m: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 }, p1: -1, p2: -1 };
          if (i.parts.push(U), U.glyphIndex = n.readUshort(s, a), a += 2, 1 & T) {
            var O = n.readShort(s, a);
            a += 2;
            var C = n.readShort(s, a);
            a += 2;
          } else
            O = n.readInt8(s, a), a++, C = n.readInt8(s, a), a++;
          2 & T ? (U.m.tx = O, U.m.ty = C) : (U.p1 = O, U.p2 = C), 8 & T ? (U.m.a = U.m.d = n.readF2dot14(s, a), a += 2) : 64 & T ? (U.m.a = n.readF2dot14(s, a), a += 2, U.m.d = n.readF2dot14(s, a), a += 2) : 128 & T && (U.m.a = n.readF2dot14(s, a), a += 2, U.m.b = n.readF2dot14(s, a), a += 2, U.m.c = n.readF2dot14(s, a), a += 2, U.m.d = n.readF2dot14(s, a), a += 2);
        } while (32 & T);
        if (256 & T) {
          var y = n.readUshort(s, a);
          for (a += 2, i.instr = [], l = 0; l < y; l++) i.instr.push(s[a]), a++;
        }
      }
      return i;
    }, r.GDEF = {}, r.GDEF.parse = function(t, e, n, s) {
      var a = e;
      e += 4;
      var i = r._bin.readUshort(t, e);
      return { glyphClassDef: i === 0 ? null : r._lctf.readClassDef(t, a + i) };
    }, r.GPOS = {}, r.GPOS.parse = function(t, e, n, s) {
      return r._lctf.parse(t, e, n, s, r.GPOS.subt);
    }, r.GPOS.subt = function(t, e, n, s) {
      var a = r._bin, i = n, l = {};
      if (l.fmt = a.readUshort(t, n), n += 2, e == 1 || e == 2 || e == 3 || e == 7 || e == 8 && l.fmt <= 2) {
        var h = a.readUshort(t, n);
        n += 2, l.coverage = r._lctf.readCoverage(t, h + i);
      }
      if (e == 1 && l.fmt == 1) {
        var d = a.readUshort(t, n);
        n += 2, d != 0 && (l.pos = r.GPOS.readValueRecord(t, n, d));
      } else if (e == 2 && l.fmt >= 1 && l.fmt <= 2) {
        d = a.readUshort(t, n), n += 2;
        var p = a.readUshort(t, n);
        n += 2;
        var g = r._lctf.numOfOnes(d), S = r._lctf.numOfOnes(p);
        if (l.fmt == 1) {
          l.pairsets = [];
          var w = a.readUshort(t, n);
          n += 2;
          for (var I = 0; I < w; I++) {
            var A = i + a.readUshort(t, n);
            n += 2;
            var k = a.readUshort(t, A);
            A += 2;
            for (var T = [], U = 0; U < k; U++) {
              var O = a.readUshort(t, A);
              A += 2, d != 0 && (x = r.GPOS.readValueRecord(t, A, d), A += 2 * g), p != 0 && (R = r.GPOS.readValueRecord(t, A, p), A += 2 * S), T.push({ gid2: O, val1: x, val2: R });
            }
            l.pairsets.push(T);
          }
        }
        if (l.fmt == 2) {
          var C = a.readUshort(t, n);
          n += 2;
          var y = a.readUshort(t, n);
          n += 2;
          var M = a.readUshort(t, n);
          n += 2;
          var L = a.readUshort(t, n);
          for (n += 2, l.classDef1 = r._lctf.readClassDef(t, i + C), l.classDef2 = r._lctf.readClassDef(t, i + y), l.matrix = [], I = 0; I < M; I++) {
            var ee = [];
            for (U = 0; U < L; U++) {
              var x = null, R = null;
              d != 0 && (x = r.GPOS.readValueRecord(t, n, d), n += 2 * g), p != 0 && (R = r.GPOS.readValueRecord(t, n, p), n += 2 * S), ee.push({ val1: x, val2: R });
            }
            l.matrix.push(ee);
          }
        }
      } else if (e == 4 && l.fmt == 1) l.markCoverage = r._lctf.readCoverage(t, a.readUshort(t, n) + i), l.baseCoverage = r._lctf.readCoverage(t, a.readUshort(t, n + 2) + i), l.markClassCount = a.readUshort(t, n + 4), l.markArray = r.GPOS.readMarkArray(t, a.readUshort(t, n + 6) + i), l.baseArray = r.GPOS.readBaseArray(t, a.readUshort(t, n + 8) + i, l.markClassCount);
      else if (e == 6 && l.fmt == 1) l.mark1Coverage = r._lctf.readCoverage(t, a.readUshort(t, n) + i), l.mark2Coverage = r._lctf.readCoverage(t, a.readUshort(t, n + 2) + i), l.markClassCount = a.readUshort(t, n + 4), l.mark1Array = r.GPOS.readMarkArray(t, a.readUshort(t, n + 6) + i), l.mark2Array = r.GPOS.readBaseArray(t, a.readUshort(t, n + 8) + i, l.markClassCount);
      else {
        if (e == 9 && l.fmt == 1) {
          var b = a.readUshort(t, n);
          n += 2;
          var K = a.readUint(t, n);
          if (n += 4, s.ltype == 9) s.ltype = b;
          else if (s.ltype != b) throw "invalid extension substitution";
          return r.GPOS.subt(t, s.ltype, i + K);
        }
        console.debug("unsupported GPOS table LookupType", e, "format", l.fmt);
      }
      return l;
    }, r.GPOS.readValueRecord = function(t, e, n) {
      var s = r._bin, a = [];
      return a.push(1 & n ? s.readShort(t, e) : 0), e += 1 & n ? 2 : 0, a.push(2 & n ? s.readShort(t, e) : 0), e += 2 & n ? 2 : 0, a.push(4 & n ? s.readShort(t, e) : 0), e += 4 & n ? 2 : 0, a.push(8 & n ? s.readShort(t, e) : 0), e += 8 & n ? 2 : 0, a;
    }, r.GPOS.readBaseArray = function(t, e, n) {
      var s = r._bin, a = [], i = e, l = s.readUshort(t, e);
      e += 2;
      for (var h = 0; h < l; h++) {
        for (var d = [], p = 0; p < n; p++) d.push(r.GPOS.readAnchorRecord(t, i + s.readUshort(t, e))), e += 2;
        a.push(d);
      }
      return a;
    }, r.GPOS.readMarkArray = function(t, e) {
      var n = r._bin, s = [], a = e, i = n.readUshort(t, e);
      e += 2;
      for (var l = 0; l < i; l++) {
        var h = r.GPOS.readAnchorRecord(t, n.readUshort(t, e + 2) + a);
        h.markClass = n.readUshort(t, e), s.push(h), e += 4;
      }
      return s;
    }, r.GPOS.readAnchorRecord = function(t, e) {
      var n = r._bin, s = {};
      return s.fmt = n.readUshort(t, e), s.x = n.readShort(t, e + 2), s.y = n.readShort(t, e + 4), s;
    }, r.GSUB = {}, r.GSUB.parse = function(t, e, n, s) {
      return r._lctf.parse(t, e, n, s, r.GSUB.subt);
    }, r.GSUB.subt = function(t, e, n, s) {
      var a = r._bin, i = n, l = {};
      if (l.fmt = a.readUshort(t, n), n += 2, e != 1 && e != 2 && e != 4 && e != 5 && e != 6) return null;
      if (e == 1 || e == 2 || e == 4 || e == 5 && l.fmt <= 2 || e == 6 && l.fmt <= 2) {
        var h = a.readUshort(t, n);
        n += 2, l.coverage = r._lctf.readCoverage(t, i + h);
      }
      if (e == 1 && l.fmt >= 1 && l.fmt <= 2) {
        if (l.fmt == 1) l.delta = a.readShort(t, n), n += 2;
        else if (l.fmt == 2) {
          var d = a.readUshort(t, n);
          n += 2, l.newg = a.readUshorts(t, n, d), n += 2 * l.newg.length;
        }
      } else if (e == 2 && l.fmt == 1) {
        d = a.readUshort(t, n), n += 2, l.seqs = [];
        for (var p = 0; p < d; p++) {
          var g = a.readUshort(t, n) + i;
          n += 2;
          var S = a.readUshort(t, g);
          l.seqs.push(a.readUshorts(t, g + 2, S));
        }
      } else if (e == 4)
        for (l.vals = [], d = a.readUshort(t, n), n += 2, p = 0; p < d; p++) {
          var w = a.readUshort(t, n);
          n += 2, l.vals.push(r.GSUB.readLigatureSet(t, i + w));
        }
      else if (e == 5 && l.fmt == 2) {
        if (l.fmt == 2) {
          var I = a.readUshort(t, n);
          n += 2, l.cDef = r._lctf.readClassDef(t, i + I), l.scset = [];
          var A = a.readUshort(t, n);
          for (n += 2, p = 0; p < A; p++) {
            var k = a.readUshort(t, n);
            n += 2, l.scset.push(k == 0 ? null : r.GSUB.readSubClassSet(t, i + k));
          }
        }
      } else if (e == 6 && l.fmt == 3) {
        if (l.fmt == 3) {
          for (p = 0; p < 3; p++) {
            d = a.readUshort(t, n), n += 2;
            for (var T = [], U = 0; U < d; U++) T.push(r._lctf.readCoverage(t, i + a.readUshort(t, n + 2 * U)));
            n += 2 * d, p == 0 && (l.backCvg = T), p == 1 && (l.inptCvg = T), p == 2 && (l.ahedCvg = T);
          }
          d = a.readUshort(t, n), n += 2, l.lookupRec = r.GSUB.readSubstLookupRecords(t, n, d);
        }
      } else {
        if (e == 7 && l.fmt == 1) {
          var O = a.readUshort(t, n);
          n += 2;
          var C = a.readUint(t, n);
          if (n += 4, s.ltype == 9) s.ltype = O;
          else if (s.ltype != O) throw "invalid extension substitution";
          return r.GSUB.subt(t, s.ltype, i + C);
        }
        console.debug("unsupported GSUB table LookupType", e, "format", l.fmt);
      }
      return l;
    }, r.GSUB.readSubClassSet = function(t, e) {
      var n = r._bin.readUshort, s = e, a = [], i = n(t, e);
      e += 2;
      for (var l = 0; l < i; l++) {
        var h = n(t, e);
        e += 2, a.push(r.GSUB.readSubClassRule(t, s + h));
      }
      return a;
    }, r.GSUB.readSubClassRule = function(t, e) {
      var n = r._bin.readUshort, s = {}, a = n(t, e), i = n(t, e += 2);
      e += 2, s.input = [];
      for (var l = 0; l < a - 1; l++) s.input.push(n(t, e)), e += 2;
      return s.substLookupRecords = r.GSUB.readSubstLookupRecords(t, e, i), s;
    }, r.GSUB.readSubstLookupRecords = function(t, e, n) {
      for (var s = r._bin.readUshort, a = [], i = 0; i < n; i++) a.push(s(t, e), s(t, e + 2)), e += 4;
      return a;
    }, r.GSUB.readChainSubClassSet = function(t, e) {
      var n = r._bin, s = e, a = [], i = n.readUshort(t, e);
      e += 2;
      for (var l = 0; l < i; l++) {
        var h = n.readUshort(t, e);
        e += 2, a.push(r.GSUB.readChainSubClassRule(t, s + h));
      }
      return a;
    }, r.GSUB.readChainSubClassRule = function(t, e) {
      for (var n = r._bin, s = {}, a = ["backtrack", "input", "lookahead"], i = 0; i < a.length; i++) {
        var l = n.readUshort(t, e);
        e += 2, i == 1 && l--, s[a[i]] = n.readUshorts(t, e, l), e += 2 * s[a[i]].length;
      }
      return l = n.readUshort(t, e), e += 2, s.subst = n.readUshorts(t, e, 2 * l), e += 2 * s.subst.length, s;
    }, r.GSUB.readLigatureSet = function(t, e) {
      var n = r._bin, s = e, a = [], i = n.readUshort(t, e);
      e += 2;
      for (var l = 0; l < i; l++) {
        var h = n.readUshort(t, e);
        e += 2, a.push(r.GSUB.readLigature(t, s + h));
      }
      return a;
    }, r.GSUB.readLigature = function(t, e) {
      var n = r._bin, s = { chain: [] };
      s.nglyph = n.readUshort(t, e), e += 2;
      var a = n.readUshort(t, e);
      e += 2;
      for (var i = 0; i < a - 1; i++) s.chain.push(n.readUshort(t, e)), e += 2;
      return s;
    }, r.head = {}, r.head.parse = function(t, e, n) {
      var s = r._bin, a = {};
      return s.readFixed(t, e), e += 4, a.fontRevision = s.readFixed(t, e), e += 4, s.readUint(t, e), e += 4, s.readUint(t, e), e += 4, a.flags = s.readUshort(t, e), e += 2, a.unitsPerEm = s.readUshort(t, e), e += 2, a.created = s.readUint64(t, e), e += 8, a.modified = s.readUint64(t, e), e += 8, a.xMin = s.readShort(t, e), e += 2, a.yMin = s.readShort(t, e), e += 2, a.xMax = s.readShort(t, e), e += 2, a.yMax = s.readShort(t, e), e += 2, a.macStyle = s.readUshort(t, e), e += 2, a.lowestRecPPEM = s.readUshort(t, e), e += 2, a.fontDirectionHint = s.readShort(t, e), e += 2, a.indexToLocFormat = s.readShort(t, e), e += 2, a.glyphDataFormat = s.readShort(t, e), e += 2, a;
    }, r.hhea = {}, r.hhea.parse = function(t, e, n) {
      var s = r._bin, a = {};
      return s.readFixed(t, e), e += 4, a.ascender = s.readShort(t, e), e += 2, a.descender = s.readShort(t, e), e += 2, a.lineGap = s.readShort(t, e), e += 2, a.advanceWidthMax = s.readUshort(t, e), e += 2, a.minLeftSideBearing = s.readShort(t, e), e += 2, a.minRightSideBearing = s.readShort(t, e), e += 2, a.xMaxExtent = s.readShort(t, e), e += 2, a.caretSlopeRise = s.readShort(t, e), e += 2, a.caretSlopeRun = s.readShort(t, e), e += 2, a.caretOffset = s.readShort(t, e), e += 2, e += 8, a.metricDataFormat = s.readShort(t, e), e += 2, a.numberOfHMetrics = s.readUshort(t, e), e += 2, a;
    }, r.hmtx = {}, r.hmtx.parse = function(t, e, n, s) {
      for (var a = r._bin, i = { aWidth: [], lsBearing: [] }, l = 0, h = 0, d = 0; d < s.maxp.numGlyphs; d++) d < s.hhea.numberOfHMetrics && (l = a.readUshort(t, e), e += 2, h = a.readShort(t, e), e += 2), i.aWidth.push(l), i.lsBearing.push(h);
      return i;
    }, r.kern = {}, r.kern.parse = function(t, e, n, s) {
      var a = r._bin, i = a.readUshort(t, e);
      if (e += 2, i == 1) return r.kern.parseV1(t, e - 2, n, s);
      var l = a.readUshort(t, e);
      e += 2;
      for (var h = { glyph1: [], rval: [] }, d = 0; d < l; d++) {
        e += 2, n = a.readUshort(t, e), e += 2;
        var p = a.readUshort(t, e);
        e += 2;
        var g = p >>> 8;
        if ((g &= 15) != 0) throw "unknown kern table format: " + g;
        e = r.kern.readFormat0(t, e, h);
      }
      return h;
    }, r.kern.parseV1 = function(t, e, n, s) {
      var a = r._bin;
      a.readFixed(t, e), e += 4;
      var i = a.readUint(t, e);
      e += 4;
      for (var l = { glyph1: [], rval: [] }, h = 0; h < i; h++) {
        a.readUint(t, e), e += 4;
        var d = a.readUshort(t, e);
        e += 2, a.readUshort(t, e), e += 2;
        var p = d >>> 8;
        if ((p &= 15) != 0) throw "unknown kern table format: " + p;
        e = r.kern.readFormat0(t, e, l);
      }
      return l;
    }, r.kern.readFormat0 = function(t, e, n) {
      var s = r._bin, a = -1, i = s.readUshort(t, e);
      e += 2, s.readUshort(t, e), e += 2, s.readUshort(t, e), e += 2, s.readUshort(t, e), e += 2;
      for (var l = 0; l < i; l++) {
        var h = s.readUshort(t, e);
        e += 2;
        var d = s.readUshort(t, e);
        e += 2;
        var p = s.readShort(t, e);
        e += 2, h != a && (n.glyph1.push(h), n.rval.push({ glyph2: [], vals: [] }));
        var g = n.rval[n.rval.length - 1];
        g.glyph2.push(d), g.vals.push(p), a = h;
      }
      return e;
    }, r.loca = {}, r.loca.parse = function(t, e, n, s) {
      var a = r._bin, i = [], l = s.head.indexToLocFormat, h = s.maxp.numGlyphs + 1;
      if (l == 0) for (var d = 0; d < h; d++) i.push(a.readUshort(t, e + (d << 1)) << 1);
      if (l == 1) for (d = 0; d < h; d++) i.push(a.readUint(t, e + (d << 2)));
      return i;
    }, r.maxp = {}, r.maxp.parse = function(t, e, n) {
      var s = r._bin, a = {}, i = s.readUint(t, e);
      return e += 4, a.numGlyphs = s.readUshort(t, e), e += 2, i == 65536 && (a.maxPoints = s.readUshort(t, e), e += 2, a.maxContours = s.readUshort(t, e), e += 2, a.maxCompositePoints = s.readUshort(t, e), e += 2, a.maxCompositeContours = s.readUshort(t, e), e += 2, a.maxZones = s.readUshort(t, e), e += 2, a.maxTwilightPoints = s.readUshort(t, e), e += 2, a.maxStorage = s.readUshort(t, e), e += 2, a.maxFunctionDefs = s.readUshort(t, e), e += 2, a.maxInstructionDefs = s.readUshort(t, e), e += 2, a.maxStackElements = s.readUshort(t, e), e += 2, a.maxSizeOfInstructions = s.readUshort(t, e), e += 2, a.maxComponentElements = s.readUshort(t, e), e += 2, a.maxComponentDepth = s.readUshort(t, e), e += 2), a;
    }, r.name = {}, r.name.parse = function(t, e, n) {
      var s = r._bin, a = {};
      s.readUshort(t, e), e += 2;
      var i = s.readUshort(t, e);
      e += 2, s.readUshort(t, e);
      for (var l, h = ["copyright", "fontFamily", "fontSubfamily", "ID", "fullName", "version", "postScriptName", "trademark", "manufacturer", "designer", "description", "urlVendor", "urlDesigner", "licence", "licenceURL", "---", "typoFamilyName", "typoSubfamilyName", "compatibleFull", "sampleText", "postScriptCID", "wwsFamilyName", "wwsSubfamilyName", "lightPalette", "darkPalette"], d = e += 2, p = 0; p < i; p++) {
        var g = s.readUshort(t, e);
        e += 2;
        var S = s.readUshort(t, e);
        e += 2;
        var w = s.readUshort(t, e);
        e += 2;
        var I = s.readUshort(t, e);
        e += 2;
        var A = s.readUshort(t, e);
        e += 2;
        var k = s.readUshort(t, e);
        e += 2;
        var T, U = h[I], O = d + 12 * i + k;
        if (g == 0) T = s.readUnicode(t, O, A / 2);
        else if (g == 3 && S == 0) T = s.readUnicode(t, O, A / 2);
        else if (S == 0) T = s.readASCII(t, O, A);
        else if (S == 1) T = s.readUnicode(t, O, A / 2);
        else if (S == 3) T = s.readUnicode(t, O, A / 2);
        else {
          if (g != 1) throw "unknown encoding " + S + ", platformID: " + g;
          T = s.readASCII(t, O, A), console.debug("reading unknown MAC encoding " + S + " as ASCII");
        }
        var C = "p" + g + "," + w.toString(16);
        a[C] == null && (a[C] = {}), a[C][U !== void 0 ? U : I] = T, a[C]._lang = w;
      }
      for (var y in a) if (a[y].postScriptName != null && a[y]._lang == 1033) return a[y];
      for (var y in a) if (a[y].postScriptName != null && a[y]._lang == 0) return a[y];
      for (var y in a) if (a[y].postScriptName != null && a[y]._lang == 3084) return a[y];
      for (var y in a) if (a[y].postScriptName != null) return a[y];
      for (var y in a) {
        l = y;
        break;
      }
      return console.debug("returning name table with languageID " + a[l]._lang), a[l];
    }, r["OS/2"] = {}, r["OS/2"].parse = function(t, e, n) {
      var s = r._bin.readUshort(t, e);
      e += 2;
      var a = {};
      if (s == 0) r["OS/2"].version0(t, e, a);
      else if (s == 1) r["OS/2"].version1(t, e, a);
      else if (s == 2 || s == 3 || s == 4) r["OS/2"].version2(t, e, a);
      else {
        if (s != 5) throw "unknown OS/2 table version: " + s;
        r["OS/2"].version5(t, e, a);
      }
      return a;
    }, r["OS/2"].version0 = function(t, e, n) {
      var s = r._bin;
      return n.xAvgCharWidth = s.readShort(t, e), e += 2, n.usWeightClass = s.readUshort(t, e), e += 2, n.usWidthClass = s.readUshort(t, e), e += 2, n.fsType = s.readUshort(t, e), e += 2, n.ySubscriptXSize = s.readShort(t, e), e += 2, n.ySubscriptYSize = s.readShort(t, e), e += 2, n.ySubscriptXOffset = s.readShort(t, e), e += 2, n.ySubscriptYOffset = s.readShort(t, e), e += 2, n.ySuperscriptXSize = s.readShort(t, e), e += 2, n.ySuperscriptYSize = s.readShort(t, e), e += 2, n.ySuperscriptXOffset = s.readShort(t, e), e += 2, n.ySuperscriptYOffset = s.readShort(t, e), e += 2, n.yStrikeoutSize = s.readShort(t, e), e += 2, n.yStrikeoutPosition = s.readShort(t, e), e += 2, n.sFamilyClass = s.readShort(t, e), e += 2, n.panose = s.readBytes(t, e, 10), e += 10, n.ulUnicodeRange1 = s.readUint(t, e), e += 4, n.ulUnicodeRange2 = s.readUint(t, e), e += 4, n.ulUnicodeRange3 = s.readUint(t, e), e += 4, n.ulUnicodeRange4 = s.readUint(t, e), e += 4, n.achVendID = [s.readInt8(t, e), s.readInt8(t, e + 1), s.readInt8(t, e + 2), s.readInt8(t, e + 3)], e += 4, n.fsSelection = s.readUshort(t, e), e += 2, n.usFirstCharIndex = s.readUshort(t, e), e += 2, n.usLastCharIndex = s.readUshort(t, e), e += 2, n.sTypoAscender = s.readShort(t, e), e += 2, n.sTypoDescender = s.readShort(t, e), e += 2, n.sTypoLineGap = s.readShort(t, e), e += 2, n.usWinAscent = s.readUshort(t, e), e += 2, n.usWinDescent = s.readUshort(t, e), e += 2;
    }, r["OS/2"].version1 = function(t, e, n) {
      var s = r._bin;
      return e = r["OS/2"].version0(t, e, n), n.ulCodePageRange1 = s.readUint(t, e), e += 4, n.ulCodePageRange2 = s.readUint(t, e), e += 4;
    }, r["OS/2"].version2 = function(t, e, n) {
      var s = r._bin;
      return e = r["OS/2"].version1(t, e, n), n.sxHeight = s.readShort(t, e), e += 2, n.sCapHeight = s.readShort(t, e), e += 2, n.usDefault = s.readUshort(t, e), e += 2, n.usBreak = s.readUshort(t, e), e += 2, n.usMaxContext = s.readUshort(t, e), e += 2;
    }, r["OS/2"].version5 = function(t, e, n) {
      var s = r._bin;
      return e = r["OS/2"].version2(t, e, n), n.usLowerOpticalPointSize = s.readUshort(t, e), e += 2, n.usUpperOpticalPointSize = s.readUshort(t, e), e += 2;
    }, r.post = {}, r.post.parse = function(t, e, n) {
      var s = r._bin, a = {};
      return a.version = s.readFixed(t, e), e += 4, a.italicAngle = s.readFixed(t, e), e += 4, a.underlinePosition = s.readShort(t, e), e += 2, a.underlineThickness = s.readShort(t, e), e += 2, a;
    }, r == null && (r = {}), r.U == null && (r.U = {}), r.U.codeToGlyph = function(t, e) {
      var n = t.cmap, s = -1;
      if (n.p0e4 != null ? s = n.p0e4 : n.p3e1 != null ? s = n.p3e1 : n.p1e0 != null ? s = n.p1e0 : n.p0e3 != null && (s = n.p0e3), s == -1) throw "no familiar platform and encoding!";
      var a = n.tables[s];
      if (a.format == 0) return e >= a.map.length ? 0 : a.map[e];
      if (a.format == 4) {
        for (var i = -1, l = 0; l < a.endCount.length; l++) if (e <= a.endCount[l]) {
          i = l;
          break;
        }
        return i == -1 || a.startCount[i] > e ? 0 : 65535 & (a.idRangeOffset[i] != 0 ? a.glyphIdArray[e - a.startCount[i] + (a.idRangeOffset[i] >> 1) - (a.idRangeOffset.length - i)] : e + a.idDelta[i]);
      }
      if (a.format == 12) {
        if (e > a.groups[a.groups.length - 1][1]) return 0;
        for (l = 0; l < a.groups.length; l++) {
          var h = a.groups[l];
          if (h[0] <= e && e <= h[1]) return h[2] + (e - h[0]);
        }
        return 0;
      }
      throw "unknown cmap table format " + a.format;
    }, r.U.glyphToPath = function(t, e) {
      var n = { cmds: [], crds: [] };
      if (t.SVG && t.SVG.entries[e]) {
        var s = t.SVG.entries[e];
        return s == null ? n : (typeof s == "string" && (s = r.SVG.toPath(s), t.SVG.entries[e] = s), s);
      }
      if (t.CFF) {
        var a = { x: 0, y: 0, stack: [], nStems: 0, haveWidth: !1, width: t.CFF.Private ? t.CFF.Private.defaultWidthX : 0, open: !1 }, i = t.CFF, l = t.CFF.Private;
        if (i.ROS) {
          for (var h = 0; i.FDSelect[h + 2] <= e; ) h += 2;
          l = i.FDArray[i.FDSelect[h + 1]].Private;
        }
        r.U._drawCFF(t.CFF.CharStrings[e], a, i, l, n);
      } else t.glyf && r.U._drawGlyf(e, t, n);
      return n;
    }, r.U._drawGlyf = function(t, e, n) {
      var s = e.glyf[t];
      s == null && (s = e.glyf[t] = r.glyf._parseGlyf(e, t)), s != null && (s.noc > -1 ? r.U._simpleGlyph(s, n) : r.U._compoGlyph(s, e, n));
    }, r.U._simpleGlyph = function(t, e) {
      for (var n = 0; n < t.noc; n++) {
        for (var s = n == 0 ? 0 : t.endPts[n - 1] + 1, a = t.endPts[n], i = s; i <= a; i++) {
          var l = i == s ? a : i - 1, h = i == a ? s : i + 1, d = 1 & t.flags[i], p = 1 & t.flags[l], g = 1 & t.flags[h], S = t.xs[i], w = t.ys[i];
          if (i == s) if (d) {
            if (!p) {
              r.U.P.moveTo(e, S, w);
              continue;
            }
            r.U.P.moveTo(e, t.xs[l], t.ys[l]);
          } else p ? r.U.P.moveTo(e, t.xs[l], t.ys[l]) : r.U.P.moveTo(e, (t.xs[l] + S) / 2, (t.ys[l] + w) / 2);
          d ? p && r.U.P.lineTo(e, S, w) : g ? r.U.P.qcurveTo(e, S, w, t.xs[h], t.ys[h]) : r.U.P.qcurveTo(e, S, w, (S + t.xs[h]) / 2, (w + t.ys[h]) / 2);
        }
        r.U.P.closePath(e);
      }
    }, r.U._compoGlyph = function(t, e, n) {
      for (var s = 0; s < t.parts.length; s++) {
        var a = { cmds: [], crds: [] }, i = t.parts[s];
        r.U._drawGlyf(i.glyphIndex, e, a);
        for (var l = i.m, h = 0; h < a.crds.length; h += 2) {
          var d = a.crds[h], p = a.crds[h + 1];
          n.crds.push(d * l.a + p * l.b + l.tx), n.crds.push(d * l.c + p * l.d + l.ty);
        }
        for (h = 0; h < a.cmds.length; h++) n.cmds.push(a.cmds[h]);
      }
    }, r.U._getGlyphClass = function(t, e) {
      var n = r._lctf.getInterval(e, t);
      return n == -1 ? 0 : e[n + 2];
    }, r.U._applySubs = function(t, e, n, s) {
      for (var a = t.length - e - 1, i = 0; i < n.tabs.length; i++) if (n.tabs[i] != null) {
        var l, h = n.tabs[i];
        if (!h.coverage || (l = r._lctf.coverageIndex(h.coverage, t[e])) != -1) {
          if (n.ltype == 1) t[e], h.fmt == 1 ? t[e] = t[e] + h.delta : t[e] = h.newg[l];
          else if (n.ltype == 4) for (var d = h.vals[l], p = 0; p < d.length; p++) {
            var g = d[p], S = g.chain.length;
            if (!(S > a)) {
              for (var w = !0, I = 0, A = 0; A < S; A++) {
                for (; t[e + I + (1 + A)] == -1; ) I++;
                g.chain[A] != t[e + I + (1 + A)] && (w = !1);
              }
              if (w) {
                for (t[e] = g.nglyph, A = 0; A < S + I; A++) t[e + A + 1] = -1;
                break;
              }
            }
          }
          else if (n.ltype == 5 && h.fmt == 2) for (var k = r._lctf.getInterval(h.cDef, t[e]), T = h.cDef[k + 2], U = h.scset[T], O = 0; O < U.length; O++) {
            var C = U[O], y = C.input;
            if (!(y.length > a)) {
              for (w = !0, A = 0; A < y.length; A++) {
                var M = r._lctf.getInterval(h.cDef, t[e + 1 + A]);
                if (k == -1 && h.cDef[M + 2] != y[A]) {
                  w = !1;
                  break;
                }
              }
              if (w) {
                var L = C.substLookupRecords;
                for (p = 0; p < L.length; p += 2) L[p], L[p + 1];
              }
            }
          }
          else if (n.ltype == 6 && h.fmt == 3) {
            if (!r.U._glsCovered(t, h.backCvg, e - h.backCvg.length) || !r.U._glsCovered(t, h.inptCvg, e) || !r.U._glsCovered(t, h.ahedCvg, e + h.inptCvg.length)) continue;
            var ee = h.lookupRec;
            for (O = 0; O < ee.length; O += 2) {
              k = ee[O];
              var x = s[ee[O + 1]];
              r.U._applySubs(t, e + k, x, s);
            }
          }
        }
      }
    }, r.U._glsCovered = function(t, e, n) {
      for (var s = 0; s < e.length; s++)
        if (r._lctf.coverageIndex(e[s], t[n + s]) == -1) return !1;
      return !0;
    }, r.U.glyphsToPath = function(t, e, n) {
      for (var s = { cmds: [], crds: [] }, a = 0, i = 0; i < e.length; i++) {
        var l = e[i];
        if (l != -1) {
          for (var h = i < e.length - 1 && e[i + 1] != -1 ? e[i + 1] : 0, d = r.U.glyphToPath(t, l), p = 0; p < d.crds.length; p += 2) s.crds.push(d.crds[p] + a), s.crds.push(d.crds[p + 1]);
          for (n && s.cmds.push(n), p = 0; p < d.cmds.length; p++) s.cmds.push(d.cmds[p]);
          n && s.cmds.push("X"), a += t.hmtx.aWidth[l], i < e.length - 1 && (a += r.U.getPairAdjustment(t, l, h));
        }
      }
      return s;
    }, r.U.P = {}, r.U.P.moveTo = function(t, e, n) {
      t.cmds.push("M"), t.crds.push(e, n);
    }, r.U.P.lineTo = function(t, e, n) {
      t.cmds.push("L"), t.crds.push(e, n);
    }, r.U.P.curveTo = function(t, e, n, s, a, i, l) {
      t.cmds.push("C"), t.crds.push(e, n, s, a, i, l);
    }, r.U.P.qcurveTo = function(t, e, n, s, a) {
      t.cmds.push("Q"), t.crds.push(e, n, s, a);
    }, r.U.P.closePath = function(t) {
      t.cmds.push("Z");
    }, r.U._drawCFF = function(t, e, n, s, a) {
      for (var i = e.stack, l = e.nStems, h = e.haveWidth, d = e.width, p = e.open, g = 0, S = e.x, w = e.y, I = 0, A = 0, k = 0, T = 0, U = 0, O = 0, C = 0, y = 0, M = 0, L = 0, ee = { val: 0, size: 0 }; g < t.length; ) {
        r.CFF.getCharString(t, g, ee);
        var x = ee.val;
        if (g += ee.size, x == "o1" || x == "o18") i.length % 2 != 0 && !h && (d = i.shift() + s.nominalWidthX), l += i.length >> 1, i.length = 0, h = !0;
        else if (x == "o3" || x == "o23")
          i.length % 2 != 0 && !h && (d = i.shift() + s.nominalWidthX), l += i.length >> 1, i.length = 0, h = !0;
        else if (x == "o4") i.length > 1 && !h && (d = i.shift() + s.nominalWidthX, h = !0), p && r.U.P.closePath(a), w += i.pop(), r.U.P.moveTo(a, S, w), p = !0;
        else if (x == "o5") for (; i.length > 0; ) S += i.shift(), w += i.shift(), r.U.P.lineTo(a, S, w);
        else if (x == "o6" || x == "o7") for (var R = i.length, b = x == "o6", K = 0; K < R; K++) {
          var H = i.shift();
          b ? S += H : w += H, b = !b, r.U.P.lineTo(a, S, w);
        }
        else if (x == "o8" || x == "o24") {
          R = i.length;
          for (var se = 0; se + 6 <= R; ) I = S + i.shift(), A = w + i.shift(), k = I + i.shift(), T = A + i.shift(), S = k + i.shift(), w = T + i.shift(), r.U.P.curveTo(a, I, A, k, T, S, w), se += 6;
          x == "o24" && (S += i.shift(), w += i.shift(), r.U.P.lineTo(a, S, w));
        } else {
          if (x == "o11") break;
          if (x == "o1234" || x == "o1235" || x == "o1236" || x == "o1237") x == "o1234" && (A = w, k = (I = S + i.shift()) + i.shift(), L = T = A + i.shift(), O = T, y = w, S = (C = (U = (M = k + i.shift()) + i.shift()) + i.shift()) + i.shift(), r.U.P.curveTo(a, I, A, k, T, M, L), r.U.P.curveTo(a, U, O, C, y, S, w)), x == "o1235" && (I = S + i.shift(), A = w + i.shift(), k = I + i.shift(), T = A + i.shift(), M = k + i.shift(), L = T + i.shift(), U = M + i.shift(), O = L + i.shift(), C = U + i.shift(), y = O + i.shift(), S = C + i.shift(), w = y + i.shift(), i.shift(), r.U.P.curveTo(a, I, A, k, T, M, L), r.U.P.curveTo(a, U, O, C, y, S, w)), x == "o1236" && (I = S + i.shift(), A = w + i.shift(), k = I + i.shift(), L = T = A + i.shift(), O = T, C = (U = (M = k + i.shift()) + i.shift()) + i.shift(), y = O + i.shift(), S = C + i.shift(), r.U.P.curveTo(a, I, A, k, T, M, L), r.U.P.curveTo(a, U, O, C, y, S, w)), x == "o1237" && (I = S + i.shift(), A = w + i.shift(), k = I + i.shift(), T = A + i.shift(), M = k + i.shift(), L = T + i.shift(), U = M + i.shift(), O = L + i.shift(), C = U + i.shift(), y = O + i.shift(), Math.abs(C - S) > Math.abs(y - w) ? S = C + i.shift() : w = y + i.shift(), r.U.P.curveTo(a, I, A, k, T, M, L), r.U.P.curveTo(a, U, O, C, y, S, w));
          else if (x == "o14") {
            if (i.length > 0 && !h && (d = i.shift() + n.nominalWidthX, h = !0), i.length == 4) {
              var he = i.shift(), Z = i.shift(), G = i.shift(), _ = i.shift(), E = r.CFF.glyphBySE(n, G), D = r.CFF.glyphBySE(n, _);
              r.U._drawCFF(n.CharStrings[E], e, n, s, a), e.x = he, e.y = Z, r.U._drawCFF(n.CharStrings[D], e, n, s, a);
            }
            p && (r.U.P.closePath(a), p = !1);
          } else if (x == "o19" || x == "o20")
            i.length % 2 != 0 && !h && (d = i.shift() + s.nominalWidthX), l += i.length >> 1, i.length = 0, h = !0, g += l + 7 >> 3;
          else if (x == "o21") i.length > 2 && !h && (d = i.shift() + s.nominalWidthX, h = !0), w += i.pop(), S += i.pop(), p && r.U.P.closePath(a), r.U.P.moveTo(a, S, w), p = !0;
          else if (x == "o22") i.length > 1 && !h && (d = i.shift() + s.nominalWidthX, h = !0), S += i.pop(), p && r.U.P.closePath(a), r.U.P.moveTo(a, S, w), p = !0;
          else if (x == "o25") {
            for (; i.length > 6; ) S += i.shift(), w += i.shift(), r.U.P.lineTo(a, S, w);
            I = S + i.shift(), A = w + i.shift(), k = I + i.shift(), T = A + i.shift(), S = k + i.shift(), w = T + i.shift(), r.U.P.curveTo(a, I, A, k, T, S, w);
          } else if (x == "o26") for (i.length % 2 && (S += i.shift()); i.length > 0; ) I = S, A = w + i.shift(), S = k = I + i.shift(), w = (T = A + i.shift()) + i.shift(), r.U.P.curveTo(a, I, A, k, T, S, w);
          else if (x == "o27") for (i.length % 2 && (w += i.shift()); i.length > 0; ) A = w, k = (I = S + i.shift()) + i.shift(), T = A + i.shift(), S = k + i.shift(), w = T, r.U.P.curveTo(a, I, A, k, T, S, w);
          else if (x == "o10" || x == "o29") {
            var N = x == "o10" ? s : n;
            if (i.length == 0) console.debug("error: empty stack");
            else {
              var B = i.pop(), V = N.Subrs[B + N.Bias];
              e.x = S, e.y = w, e.nStems = l, e.haveWidth = h, e.width = d, e.open = p, r.U._drawCFF(V, e, n, s, a), S = e.x, w = e.y, l = e.nStems, h = e.haveWidth, d = e.width, p = e.open;
            }
          } else if (x == "o30" || x == "o31") {
            var j = i.length, Y = (se = 0, x == "o31");
            for (se += j - (R = -3 & j); se < R; ) Y ? (A = w, k = (I = S + i.shift()) + i.shift(), w = (T = A + i.shift()) + i.shift(), R - se == 5 ? (S = k + i.shift(), se++) : S = k, Y = !1) : (I = S, A = w + i.shift(), k = I + i.shift(), T = A + i.shift(), S = k + i.shift(), R - se == 5 ? (w = T + i.shift(), se++) : w = T, Y = !0), r.U.P.curveTo(a, I, A, k, T, S, w), se += 4;
          } else {
            if ((x + "").charAt(0) == "o") throw console.debug("Unknown operation: " + x, t), x;
            i.push(x);
          }
        }
      }
      e.x = S, e.y = w, e.nStems = l, e.haveWidth = h, e.width = d, e.open = p;
    };
    var u = r, c = { Typr: u };
    return o.Typr = u, o.default = c, Object.defineProperty(o, "__esModule", { value: !0 }), o;
  })({}).Typr;
}
function us() {
  return (function(o) {
    var r = Uint8Array, u = Uint16Array, c = Uint32Array, t = new r([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0, 0]), e = new r([0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 0, 0]), n = new r([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]), s = function(x, R) {
      for (var b = new u(31), K = 0; K < 31; ++K) b[K] = R += 1 << x[K - 1];
      var H = new c(b[30]);
      for (K = 1; K < 30; ++K) for (var se = b[K]; se < b[K + 1]; ++se) H[se] = se - b[K] << 5 | K;
      return [b, H];
    }, a = s(t, 2), i = a[0], l = a[1];
    i[28] = 258, l[258] = 28;
    for (var h = s(e, 0)[0], d = new u(32768), p = 0; p < 32768; ++p) {
      var g = (43690 & p) >>> 1 | (21845 & p) << 1;
      g = (61680 & (g = (52428 & g) >>> 2 | (13107 & g) << 2)) >>> 4 | (3855 & g) << 4, d[p] = ((65280 & g) >>> 8 | (255 & g) << 8) >>> 1;
    }
    var S = function(x, R, b) {
      for (var K = x.length, H = 0, se = new u(R); H < K; ++H) ++se[x[H] - 1];
      var he, Z = new u(R);
      for (H = 0; H < R; ++H) Z[H] = Z[H - 1] + se[H - 1] << 1;
      {
        he = new u(1 << R);
        var G = 15 - R;
        for (H = 0; H < K; ++H) if (x[H]) for (var _ = H << 4 | x[H], E = R - x[H], D = Z[x[H] - 1]++ << E, N = D | (1 << E) - 1; D <= N; ++D) he[d[D] >>> G] = _;
      }
      return he;
    }, w = new r(288);
    for (p = 0; p < 144; ++p) w[p] = 8;
    for (p = 144; p < 256; ++p) w[p] = 9;
    for (p = 256; p < 280; ++p) w[p] = 7;
    for (p = 280; p < 288; ++p) w[p] = 8;
    var I = new r(32);
    for (p = 0; p < 32; ++p) I[p] = 5;
    var A = S(w, 9), k = S(I, 5), T = function(x) {
      for (var R = x[0], b = 1; b < x.length; ++b) x[b] > R && (R = x[b]);
      return R;
    }, U = function(x, R, b) {
      var K = R / 8 | 0;
      return (x[K] | x[K + 1] << 8) >> (7 & R) & b;
    }, O = function(x, R) {
      var b = R / 8 | 0;
      return (x[b] | x[b + 1] << 8 | x[b + 2] << 16) >> (7 & R);
    }, C = ["unexpected EOF", "invalid block type", "invalid length/literal", "invalid distance", "stream finished", "no stream handler", , "no callback", "invalid UTF-8 data", "extra field too long", "date not in range 1980-2099", "filename too long", "stream finishing", "invalid zip data"], y = function(x, R, b) {
      var K = new Error(R || C[x]);
      if (K.code = x, Error.captureStackTrace && Error.captureStackTrace(K, y), !b) throw K;
      return K;
    }, M = function(x, R, b) {
      var K = x.length;
      if (!K || b && !b.l && K < 5) return R || new r(0);
      var H = !R || b, se = !b || b.i;
      b || (b = {}), R || (R = new r(3 * K));
      var he, Z = function(be) {
        var Ye = R.length;
        if (be > Ye) {
          var Ge = new r(Math.max(2 * Ye, be));
          Ge.set(R), R = Ge;
        }
      }, G = b.f || 0, _ = b.p || 0, E = b.b || 0, D = b.l, N = b.d, B = b.m, V = b.n, j = 8 * K;
      do {
        if (!D) {
          b.f = G = U(x, _, 1);
          var Y = U(x, _ + 1, 3);
          if (_ += 3, !Y) {
            var ue = x[(de = ((he = _) / 8 | 0) + (7 & he && 1) + 4) - 4] | x[de - 3] << 8, ve = de + ue;
            if (ve > K) {
              se && y(0);
              break;
            }
            H && Z(E + ue), R.set(x.subarray(de, ve), E), b.b = E += ue, b.p = _ = 8 * ve;
            continue;
          }
          if (Y == 1) D = A, N = k, B = 9, V = 5;
          else if (Y == 2) {
            var oe = U(x, _, 31) + 257, $ = U(x, _ + 10, 15) + 4, Fe = oe + U(x, _ + 5, 31) + 1;
            _ += 14;
            for (var Te = new r(Fe), fe = new r(19), ge = 0; ge < $; ++ge) fe[n[ge]] = U(x, _ + 3 * ge, 7);
            _ += 3 * $;
            var Ee = T(fe), te = (1 << Ee) - 1, me = S(fe, Ee);
            for (ge = 0; ge < Fe; ) {
              var de, q = me[U(x, _, te)];
              if (_ += 15 & q, (de = q >>> 4) < 16) Te[ge++] = de;
              else {
                var Ae = 0, ce = 0;
                for (de == 16 ? (ce = 3 + U(x, _, 3), _ += 2, Ae = Te[ge - 1]) : de == 17 ? (ce = 3 + U(x, _, 7), _ += 3) : de == 18 && (ce = 11 + U(x, _, 127), _ += 7); ce--; ) Te[ge++] = Ae;
              }
            }
            var xe = Te.subarray(0, oe), le = Te.subarray(oe);
            B = T(xe), V = T(le), D = S(xe, B), N = S(le, V);
          } else y(1);
          if (_ > j) {
            se && y(0);
            break;
          }
        }
        H && Z(E + 131072);
        for (var ze = (1 << B) - 1, ye = (1 << V) - 1, _e = _; ; _e = _) {
          var Se = (Ae = D[O(x, _) & ze]) >>> 4;
          if ((_ += 15 & Ae) > j) {
            se && y(0);
            break;
          }
          if (Ae || y(2), Se < 256) R[E++] = Se;
          else {
            if (Se == 256) {
              _e = _, D = null;
              break;
            }
            var ke = Se - 254;
            if (Se > 264) {
              var Je = t[ge = Se - 257];
              ke = U(x, _, (1 << Je) - 1) + i[ge], _ += Je;
            }
            var tr = N[O(x, _) & ye], Re = tr >>> 4;
            if (tr || y(3), _ += 15 & tr, le = h[Re], Re > 3 && (Je = e[Re], le += O(x, _) & (1 << Je) - 1, _ += Je), _ > j) {
              se && y(0);
              break;
            }
            H && Z(E + 131072);
            for (var Me = E + ke; E < Me; E += 4) R[E] = R[E - le], R[E + 1] = R[E + 1 - le], R[E + 2] = R[E + 2 - le], R[E + 3] = R[E + 3 - le];
            E = Me;
          }
        }
        b.l = D, b.p = _e, b.b = E, D && (G = 1, b.m = B, b.d = N, b.n = V);
      } while (!G);
      return E == R.length ? R : (function(be, Ye, Ge) {
        (Ge == null || Ge > be.length) && (Ge = be.length);
        var We = new (be instanceof u ? u : be instanceof c ? c : r)(Ge - Ye);
        return We.set(be.subarray(Ye, Ge)), We;
      })(R, 0, E);
    }, L = new r(0), ee = typeof TextDecoder < "u" && new TextDecoder();
    try {
      ee.decode(L, { stream: !0 });
    } catch {
    }
    return o.convert_streams = function(x) {
      var R = new DataView(x), b = 0;
      function K() {
        var oe = R.getUint16(b);
        return b += 2, oe;
      }
      function H() {
        var oe = R.getUint32(b);
        return b += 4, oe;
      }
      function se(oe) {
        ue.setUint16(ve, oe), ve += 2;
      }
      function he(oe) {
        ue.setUint32(ve, oe), ve += 4;
      }
      for (var Z = { signature: H(), flavor: H(), length: H(), numTables: K(), reserved: K(), totalSfntSize: H(), majorVersion: K(), minorVersion: K(), metaOffset: H(), metaLength: H(), metaOrigLength: H(), privOffset: H(), privLength: H() }, G = 0; Math.pow(2, G) <= Z.numTables; ) G++;
      G--;
      for (var _ = 16 * Math.pow(2, G), E = 16 * Z.numTables - _, D = 12, N = [], B = 0; B < Z.numTables; B++) N.push({ tag: H(), offset: H(), compLength: H(), origLength: H(), origChecksum: H() }), D += 16;
      var V, j = new Uint8Array(12 + 16 * N.length + N.reduce((function(oe, $) {
        return oe + $.origLength + 4;
      }), 0)), Y = j.buffer, ue = new DataView(Y), ve = 0;
      return he(Z.flavor), se(Z.numTables), se(_), se(G), se(E), N.forEach((function(oe) {
        he(oe.tag), he(oe.origChecksum), he(D), he(oe.origLength), oe.outOffset = D, (D += oe.origLength) % 4 != 0 && (D += 4 - D % 4);
      })), N.forEach((function(oe) {
        var $, Fe = x.slice(oe.offset, oe.offset + oe.compLength);
        if (oe.compLength != oe.origLength) {
          var Te = new Uint8Array(oe.origLength);
          $ = new Uint8Array(Fe, 2), M($, Te);
        } else Te = new Uint8Array(Fe);
        j.set(Te, oe.outOffset);
        var fe = 0;
        (D = oe.outOffset + oe.origLength) % 4 != 0 && (fe = 4 - D % 4), j.set(new Uint8Array(fe).buffer, oe.outOffset + oe.origLength), V = D + fe;
      })), Y.slice(0, V);
    }, Object.defineProperty(o, "__esModule", { value: !0 }), o;
  })({}).convert_streams;
}
function cs(o, r) {
  const u = {
    M: 2,
    L: 2,
    Q: 4,
    C: 6,
    Z: 0
  }, c = { C: "18g,ca,368,1kz", D: "17k,6,2,2+4,5+c,2+6,2+1,10+1,9+f,j+11,2+1,a,2,2+1,15+2,3,j+2,6+3,2+8,2,2,2+1,w+a,4+e,3+3,2,3+2,3+5,23+w,2f+4,3,2+9,2,b,2+3,3,1k+9,6+1,3+1,2+2,2+d,30g,p+y,1,1+1g,f+x,2,sd2+1d,jf3+4,f+3,2+4,2+2,b+3,42,2,4+2,2+1,2,3,t+1,9f+w,2,el+2,2+g,d+2,2l,2+1,5,3+1,2+1,2,3,6,16wm+1v", R: "17m+3,2,2,6+3,m,15+2,2+2,h+h,13,3+8,2,2,3+1,2,p+1,x,5+4,5,a,2,2,3,u,c+2,g+1,5,2+1,4+1,5j,6+1,2,b,2+2,f,2+1,1s+2,2,3+1,7,1ez0,2,2+1,4+4,b,4,3,b,42,2+2,4,3,2+1,2,o+3,ae,ep,x,2o+2,3+1,3,5+1,6", L: "x9u,jff,a,fd,jv", T: "4t,gj+33,7o+4,1+1,7c+18,2,2+1,2+1,2,21+a,2,1b+k,h,2u+6,3+5,3+1,2+3,y,2,v+q,2k+a,1n+8,a,p+3,2+8,2+2,2+4,18+2,3c+e,2+v,1k,2,5+7,5,4+6,b+1,u,1n,5+3,9,l+1,r,3+1,1m,5+1,5+1,3+2,4,v+1,4,c+1,1m,5+4,2+1,5,l+1,n+5,2,1n,3,2+3,9,8+1,c+1,v,1q,d,1f,4,1m+2,6+2,2+3,8+1,c+1,u,1n,3,7,6+1,l+1,t+1,1m+1,5+3,9,l+1,u,21,8+2,2,2j,3+6,d+7,2r,3+8,c+5,23+1,s,2,2,1k+d,2+4,2+1,6+a,2+z,a,2v+3,2+5,2+1,3+1,q+1,5+2,h+3,e,3+1,7,g,jk+2,qb+2,u+2,u+1,v+1,1t+1,2+6,9,3+a,a,1a+2,3c+1,z,3b+2,5+1,a,7+2,64+1,3,1n,2+6,2,2,3+7,7+9,3,1d+d,1,1+1,1s+3,1d,2+4,2,6,15+8,d+1,x+3,3+1,2+2,1l,2+1,4,2+2,1n+7,3+1,49+2,2+c,2+6,5,7,4+1,5j+1l,2+4,ek,3+1,r+4,1e+4,6+5,2p+c,1+3,1,1+2,1+b,2db+2,3y,2p+v,ff+3,30+1,n9x,1+2,2+9,x+1,29+1,7l,4,5,q+1,6,48+1,r+h,e,13+7,q+a,1b+2,1d,3+3,3+1,14,1w+5,3+1,3+1,d,9,1c,1g,2+2,3+1,6+1,2,17+1,9,6n,3,5,fn5,ki+f,h+f,5s,6y+2,ea,6b,46+4,1af+2,2+1,6+3,15+2,5,4m+1,fy+3,as+1,4a+a,4x,1j+e,1l+2,1e+3,3+1,1y+2,11+4,2+7,1r,d+1,1h+8,b+3,3,2o+2,3,2+1,7,4h,4+7,m+1,1m+1,4,12+6,4+4,5g+7,3+2,2,o,2d+5,2,5+1,2+1,6n+3,7+1,2+1,s+1,2e+7,3,2+1,2z,2,3+5,2,2u+2,3+3,2+4,78+8,2+1,75+1,2,5,41+3,3+1,5,x+9,15+5,3+3,9,a+5,3+2,1b+c,2+1,bb+6,2+5,2,2b+l,3+6,2+1,2+1,3f+5,4,2+1,2+6,2,21+1,4,2,9o+1,470+8,at4+4,1o+6,t5,1s+3,2a,f5l+1,2+3,43o+2,a+7,1+7,3+6,v+3,45+2,1j0+1i,5+1d,9,f,n+4,2+e,11t+6,2+g,3+6,2+1,2+4,7a+6,c6+3,15t+6,32+6,1,gzau,v+2n,3l+6n" }, t = 1, e = 2, n = 4, s = 8, a = 16, i = 32;
  let l;
  function h(C) {
    if (!l) {
      const y = {
        R: e,
        L: t,
        D: n,
        C: a,
        U: i,
        T: s
      };
      l = /* @__PURE__ */ new Map();
      for (let M in c) {
        let L = 0;
        c[M].split(",").forEach((ee) => {
          let [x, R] = ee.split("+");
          x = parseInt(x, 36), R = R ? parseInt(R, 36) : 0, l.set(L += x, y[M]);
          for (let b = R; b--; )
            l.set(++L, y[M]);
        });
      }
    }
    return l.get(C) || i;
  }
  const d = 1, p = 2, g = 3, S = 4, w = [null, "isol", "init", "fina", "medi"];
  function I(C) {
    const y = new Uint8Array(C.length);
    let M = i, L = d, ee = -1;
    for (let x = 0; x < C.length; x++) {
      const R = C.codePointAt(x);
      let b = h(R) | 0, K = d;
      b & s || (M & (t | n | a) ? b & (e | n | a) ? (K = g, (L === d || L === g) && y[ee]++) : b & (t | i) && (L === p || L === S) && y[ee]-- : M & (e | i) && (L === p || L === S) && y[ee]--, L = y[x] = K, M = b, ee = x, R > 65535 && x++);
    }
    return y;
  }
  function A(C, y) {
    const M = [];
    for (let ee = 0; ee < y.length; ee++) {
      const x = y.codePointAt(ee);
      x > 65535 && ee++, M.push(o.U.codeToGlyph(C, x));
    }
    const L = C.GSUB;
    if (L) {
      const { lookupList: ee, featureList: x } = L;
      let R;
      const b = /^(rlig|liga|mset|isol|init|fina|medi|half|pres|blws|ccmp)$/, K = [];
      x.forEach((H) => {
        if (b.test(H.tag))
          for (let se = 0; se < H.tab.length; se++) {
            if (K[H.tab[se]]) continue;
            K[H.tab[se]] = !0;
            const he = ee[H.tab[se]], Z = /^(isol|init|fina|medi)$/.test(H.tag);
            Z && !R && (R = I(y));
            for (let G = 0; G < M.length; G++)
              (!R || !Z || w[R[G]] === H.tag) && o.U._applySubs(M, G, he, ee);
          }
      });
    }
    return M;
  }
  function k(C, y) {
    const M = new Int16Array(y.length * 3);
    let L = 0;
    for (; L < y.length; L++) {
      const b = y[L];
      if (b === -1) continue;
      M[L * 3 + 2] = C.hmtx.aWidth[b];
      const K = C.GPOS;
      if (K) {
        const H = K.lookupList;
        for (let se = 0; se < H.length; se++) {
          const he = H[se];
          for (let Z = 0; Z < he.tabs.length; Z++) {
            const G = he.tabs[Z];
            if (he.ltype === 1) {
              if (o._lctf.coverageIndex(G.coverage, b) !== -1 && G.pos) {
                R(G.pos, L);
                break;
              }
            } else if (he.ltype === 2) {
              let _ = null, E = ee();
              if (E !== -1) {
                const D = o._lctf.coverageIndex(G.coverage, y[E]);
                if (D !== -1) {
                  if (G.fmt === 1) {
                    const N = G.pairsets[D];
                    for (let B = 0; B < N.length; B++)
                      N[B].gid2 === b && (_ = N[B]);
                  } else if (G.fmt === 2) {
                    const N = o.U._getGlyphClass(y[E], G.classDef1), B = o.U._getGlyphClass(b, G.classDef2);
                    _ = G.matrix[N][B];
                  }
                  if (_) {
                    _.val1 && R(_.val1, E), _.val2 && R(_.val2, L);
                    break;
                  }
                }
              }
            } else if (he.ltype === 4) {
              const _ = o._lctf.coverageIndex(G.markCoverage, b);
              if (_ !== -1) {
                const E = ee(x), D = E === -1 ? -1 : o._lctf.coverageIndex(G.baseCoverage, y[E]);
                if (D !== -1) {
                  const N = G.markArray[_], B = G.baseArray[D][N.markClass];
                  M[L * 3] = B.x - N.x + M[E * 3] - M[E * 3 + 2], M[L * 3 + 1] = B.y - N.y + M[E * 3 + 1];
                  break;
                }
              }
            } else if (he.ltype === 6) {
              const _ = o._lctf.coverageIndex(G.mark1Coverage, b);
              if (_ !== -1) {
                const E = ee();
                if (E !== -1) {
                  const D = y[E];
                  if (T(C, D) === 3) {
                    const N = o._lctf.coverageIndex(G.mark2Coverage, D);
                    if (N !== -1) {
                      const B = G.mark1Array[_], V = G.mark2Array[N][B.markClass];
                      M[L * 3] = V.x - B.x + M[E * 3] - M[E * 3 + 2], M[L * 3 + 1] = V.y - B.y + M[E * 3 + 1];
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      } else if (C.kern && !C.cff) {
        const H = ee();
        if (H !== -1) {
          const se = C.kern.glyph1.indexOf(y[H]);
          if (se !== -1) {
            const he = C.kern.rval[se].glyph2.indexOf(b);
            he !== -1 && (M[H * 3 + 2] += C.kern.rval[se].vals[he]);
          }
        }
      }
    }
    return M;
    function ee(b) {
      for (let K = L - 1; K >= 0; K--)
        if (y[K] !== -1 && (!b || b(y[K])))
          return K;
      return -1;
    }
    function x(b) {
      return T(C, b) === 1;
    }
    function R(b, K) {
      for (let H = 0; H < 3; H++)
        M[K * 3 + H] += b[H] || 0;
    }
  }
  function T(C, y) {
    const M = C.GDEF && C.GDEF.glyphClassDef;
    return M ? o.U._getGlyphClass(y, M) : 0;
  }
  function U(...C) {
    for (let y = 0; y < C.length; y++)
      if (typeof C[y] == "number")
        return C[y];
  }
  function O(C) {
    const y = /* @__PURE__ */ Object.create(null), M = C["OS/2"], L = C.hhea, ee = C.head.unitsPerEm, x = U(M && M.sTypoAscender, L && L.ascender, ee), R = {
      unitsPerEm: ee,
      ascender: x,
      descender: U(M && M.sTypoDescender, L && L.descender, 0),
      capHeight: U(M && M.sCapHeight, x),
      xHeight: U(M && M.sxHeight, x),
      lineGap: U(M && M.sTypoLineGap, L && L.lineGap),
      supportsCodePoint(b) {
        return o.U.codeToGlyph(C, b) > 0;
      },
      forEachGlyph(b, K, H, se) {
        let he = 0;
        const Z = 1 / R.unitsPerEm * K, G = A(C, b);
        let _ = 0;
        const E = k(C, G);
        return G.forEach((D, N) => {
          if (D !== -1) {
            let B = y[D];
            if (!B) {
              const { cmds: V, crds: j } = o.U.glyphToPath(C, D);
              let Y = "", ue = 0;
              for (let Te = 0, fe = V.length; Te < fe; Te++) {
                const ge = u[V[Te]];
                Y += V[Te];
                for (let Ee = 1; Ee <= ge; Ee++)
                  Y += (Ee > 1 ? "," : "") + j[ue++];
              }
              let ve, oe, $, Fe;
              if (j.length) {
                ve = oe = 1 / 0, $ = Fe = -1 / 0;
                for (let Te = 0, fe = j.length; Te < fe; Te += 2) {
                  let ge = j[Te], Ee = j[Te + 1];
                  ge < ve && (ve = ge), Ee < oe && (oe = Ee), ge > $ && ($ = ge), Ee > Fe && (Fe = Ee);
                }
              } else
                ve = $ = oe = Fe = 0;
              B = y[D] = {
                index: D,
                advanceWidth: C.hmtx.aWidth[D],
                xMin: ve,
                yMin: oe,
                xMax: $,
                yMax: Fe,
                path: Y
              };
            }
            se.call(
              null,
              B,
              he + E[N * 3] * Z,
              E[N * 3 + 1] * Z,
              _
            ), he += E[N * 3 + 2] * Z, H && (he += H * K);
          }
          _ += b.codePointAt(_) > 65535 ? 2 : 1;
        }), he;
      }
    };
    return R;
  }
  return function(y) {
    const M = new Uint8Array(y, 0, 4), L = o._bin.readASCII(M, 0, 4);
    if (L === "wOFF")
      y = r(y);
    else if (L === "wOF2")
      throw new Error("woff2 fonts not supported");
    return O(o.parse(y)[0]);
  };
}
const fs = /* @__PURE__ */ nt({
  name: "Typr Font Parser",
  dependencies: [ls, us, cs],
  init(o, r, u) {
    const c = o(), t = r();
    return u(c, t);
  }
});
function hs() {
  return (function(o) {
    var r = function() {
      this.buckets = /* @__PURE__ */ new Map();
    };
    r.prototype.add = function(k) {
      var T = k >> 5;
      this.buckets.set(T, (this.buckets.get(T) || 0) | 1 << (31 & k));
    }, r.prototype.has = function(k) {
      var T = this.buckets.get(k >> 5);
      return T !== void 0 && (T & 1 << (31 & k)) != 0;
    }, r.prototype.serialize = function() {
      var k = [];
      return this.buckets.forEach((function(T, U) {
        k.push((+U).toString(36) + ":" + T.toString(36));
      })), k.join(",");
    }, r.prototype.deserialize = function(k) {
      var T = this;
      this.buckets.clear(), k.split(",").forEach((function(U) {
        var O = U.split(":");
        T.buckets.set(parseInt(O[0], 36), parseInt(O[1], 36));
      }));
    };
    var u = Math.pow(2, 8), c = u - 1, t = ~c;
    function e(k) {
      var T = (function(O) {
        return O & t;
      })(k).toString(16), U = (function(O) {
        return (O & t) + u - 1;
      })(k).toString(16);
      return "codepoint-index/plane" + (k >> 16) + "/" + T + "-" + U + ".json";
    }
    function n(k, T) {
      var U = k & c, O = T.codePointAt(U / 6 | 0);
      return ((O = (O || 48) - 48) & 1 << U % 6) != 0;
    }
    function s(k, T) {
      var U;
      (U = k, U.replace(/U\+/gi, "").replace(/^,+|,+$/g, "").split(/,+/).map((function(O) {
        return O.split("-").map((function(C) {
          return parseInt(C.trim(), 16);
        }));
      }))).forEach((function(O) {
        var C = O[0], y = O[1];
        y === void 0 && (y = C), T(C, y);
      }));
    }
    function a(k, T) {
      s(k, (function(U, O) {
        for (var C = U; C <= O; C++) T(C);
      }));
    }
    var i = {}, l = {}, h = /* @__PURE__ */ new WeakMap(), d = "https://cdn.jsdelivr.net/gh/lojjic/unicode-font-resolver@v1.0.1/packages/data";
    function p(k) {
      var T = h.get(k);
      return T || (T = new r(), a(k.ranges, (function(U) {
        return T.add(U);
      })), h.set(k, T)), T;
    }
    var g, S = /* @__PURE__ */ new Map();
    function w(k, T, U) {
      return k[T] ? T : k[U] ? U : (function(O) {
        for (var C in O) return C;
      })(k);
    }
    function I(k, T) {
      var U = T;
      if (!k.includes(U)) {
        U = 1 / 0;
        for (var O = 0; O < k.length; O++) Math.abs(k[O] - T) < Math.abs(U - T) && (U = k[O]);
      }
      return U;
    }
    function A(k) {
      return g || (g = /* @__PURE__ */ new Set(), a("9-D,20,85,A0,1680,2000-200A,2028-202F,205F,3000", (function(T) {
        g.add(T);
      }))), g.has(k);
    }
    return o.CodePointSet = r, o.clearCache = function() {
      i = {}, l = {};
    }, o.getFontsForString = function(k, T) {
      T === void 0 && (T = {});
      var U, O = T.lang;
      O === void 0 && (O = new RegExp("\\p{Script=Hangul}", "u").test(U = k) ? "ko" : new RegExp("\\p{Script=Hiragana}|\\p{Script=Katakana}", "u").test(U) ? "ja" : "en");
      var C = T.category;
      C === void 0 && (C = "sans-serif");
      var y = T.style;
      y === void 0 && (y = "normal");
      var M = T.weight;
      M === void 0 && (M = 400);
      var L = (T.dataUrl || d).replace(/\/$/g, ""), ee = /* @__PURE__ */ new Map(), x = new Uint8Array(k.length), R = {}, b = {}, K = new Array(k.length), H = /* @__PURE__ */ new Map(), se = !1;
      function he(_) {
        var E = S.get(_);
        return E || (E = fetch(L + "/" + _).then((function(D) {
          if (!D.ok) throw new Error(D.statusText);
          return D.json().then((function(N) {
            if (!Array.isArray(N) || N[0] !== 1) throw new Error("Incorrect schema version; need 1, got " + N[0]);
            return N[1];
          }));
        })).catch((function(D) {
          if (L !== d) return se || (console.error('unicode-font-resolver: Failed loading from dataUrl "' + L + '", trying default CDN. ' + D.message), se = !0), L = d, S.delete(_), he(_);
          throw D;
        })), S.set(_, E)), E;
      }
      for (var Z = function(_) {
        var E = k.codePointAt(_), D = e(E);
        K[_] = D, i[D] || H.has(D) || H.set(D, he(D).then((function(N) {
          i[D] = N;
        }))), E > 65535 && (_++, G = _);
      }, G = 0; G < k.length; G++) Z(G);
      return Promise.all(H.values()).then((function() {
        H.clear();
        for (var _ = function(D) {
          var N = k.codePointAt(D), B = null, V = i[K[D]], j = void 0;
          for (var Y in V) {
            var ue = b[Y];
            if (ue === void 0 && (ue = b[Y] = new RegExp(Y).test(O || "en")), ue) {
              for (var ve in j = Y, V[Y]) if (n(N, V[Y][ve])) {
                B = ve;
                break;
              }
              break;
            }
          }
          if (!B) {
            e: for (var oe in V) if (oe !== j) {
              for (var $ in V[oe]) if (n(N, V[oe][$])) {
                B = $;
                break e;
              }
            }
          }
          B || (console.debug("No font coverage for U+" + N.toString(16)), B = "latin"), K[D] = B, l[B] || H.has(B) || H.set(B, he("font-meta/" + B + ".json").then((function(Fe) {
            l[B] = Fe;
          }))), N > 65535 && (D++, E = D);
        }, E = 0; E < k.length; E++) _(E);
        return Promise.all(H.values());
      })).then((function() {
        for (var _, E = null, D = 0; D < k.length; D++) {
          var N = k.codePointAt(D);
          if (E && (A(N) || p(E).has(N))) x[D] = x[D - 1];
          else {
            E = l[K[D]];
            var B = R[E.id];
            if (!B) {
              var V = E.typeforms, j = w(V, C, "sans-serif"), Y = w(V[j], y, "normal"), ue = I((_ = V[j]) === null || _ === void 0 ? void 0 : _[Y], M);
              B = R[E.id] = L + "/font-files/" + E.id + "/" + j + "." + Y + "." + ue + ".woff";
            }
            var ve = ee.get(B);
            ve == null && (ve = ee.size, ee.set(B, ve)), x[D] = ve;
          }
          N > 65535 && (D++, x[D] = x[D - 1]);
        }
        return { fontUrls: Array.from(ee.keys()), chars: x };
      }));
    }, Object.defineProperty(o, "__esModule", { value: !0 }), o;
  })({});
}
function ds(o, r) {
  const u = /* @__PURE__ */ Object.create(null), c = /* @__PURE__ */ Object.create(null);
  function t(n, s) {
    const a = (i) => {
      console.error(`Failure loading font ${n}`, i);
    };
    try {
      const i = new XMLHttpRequest();
      i.open("get", n, !0), i.responseType = "arraybuffer", i.onload = function() {
        if (i.status >= 400)
          a(new Error(i.statusText));
        else if (i.status > 0)
          try {
            const l = o(i.response);
            l.src = n, s(l);
          } catch (l) {
            a(l);
          }
      }, i.onerror = a, i.send();
    } catch (i) {
      a(i);
    }
  }
  function e(n, s) {
    let a = u[n];
    a ? s(a) : c[n] ? c[n].push(s) : (c[n] = [s], t(n, (i) => {
      i.src = n, u[n] = i, c[n].forEach((l) => l(i)), delete c[n];
    }));
  }
  return function(n, s, {
    lang: a,
    fonts: i = [],
    style: l = "normal",
    weight: h = "normal",
    unicodeFontsURL: d
  } = {}) {
    const p = new Uint8Array(n.length), g = [];
    n.length || A();
    const S = /* @__PURE__ */ new Map(), w = [];
    if (l !== "italic" && (l = "normal"), typeof h != "number" && (h = h === "bold" ? 700 : 400), i && !Array.isArray(i) && (i = [i]), i = i.slice().filter((T) => !T.lang || T.lang.test(a)).reverse(), i.length) {
      let C = 0;
      (function y(M = 0) {
        for (let L = M, ee = n.length; L < ee; L++) {
          const x = n.codePointAt(L);
          if (C === 1 && g[p[L - 1]].supportsCodePoint(x) || L > 0 && /\s/.test(n[L]))
            p[L] = p[L - 1], C === 2 && (w[w.length - 1][1] = L);
          else
            for (let R = p[L], b = i.length; R <= b; R++)
              if (R === b) {
                const K = C === 2 ? w[w.length - 1] : w[w.length] = [L, L];
                K[1] = L, C = 2;
              } else {
                p[L] = R;
                const { src: K, unicodeRange: H } = i[R];
                if (!H || k(x, H)) {
                  const se = u[K];
                  if (!se) {
                    e(K, () => {
                      y(L);
                    });
                    return;
                  }
                  if (se.supportsCodePoint(x)) {
                    let he = S.get(se);
                    typeof he != "number" && (he = g.length, g.push(se), S.set(se, he)), p[L] = he, C = 1;
                    break;
                  }
                }
              }
          x > 65535 && L + 1 < ee && (p[L + 1] = p[L], L++, C === 2 && (w[w.length - 1][1] = L));
        }
        I();
      })();
    } else
      w.push([0, n.length - 1]), I();
    function I() {
      if (w.length) {
        const T = w.map((U) => n.substring(U[0], U[1] + 1)).join(`
`);
        r.getFontsForString(T, {
          lang: a || void 0,
          style: l,
          weight: h,
          dataUrl: d
        }).then(({ fontUrls: U, chars: O }) => {
          const C = g.length;
          let y = 0;
          w.forEach((L) => {
            for (let ee = 0, x = L[1] - L[0]; ee <= x; ee++)
              p[L[0] + ee] = O[y++] + C;
            y++;
          });
          let M = 0;
          U.forEach((L, ee) => {
            e(L, (x) => {
              g[ee + C] = x, ++M === U.length && A();
            });
          });
        });
      } else
        A();
    }
    function A() {
      s({
        chars: p,
        fonts: g
      });
    }
    function k(T, U) {
      for (let O = 0; O < U.length; O++) {
        const [C, y = C] = U[O];
        if (C <= T && T <= y)
          return !0;
      }
      return !1;
    }
  };
}
const vs = /* @__PURE__ */ nt({
  name: "FontResolver",
  dependencies: [
    ds,
    fs,
    hs
  ],
  init(o, r, u) {
    return o(r, u());
  }
});
function ps(o, r) {
  const c = /[\u00AD\u034F\u061C\u115F-\u1160\u17B4-\u17B5\u180B-\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFF8]/, t = "[^\\S\\u00A0]", e = new RegExp(`${t}|[\\-\\u007C\\u00AD\\u2010\\u2012-\\u2014\\u2027\\u2056\\u2E17\\u2E40]`);
  function n({ text: g, lang: S, fonts: w, style: I, weight: A, preResolvedFonts: k, unicodeFontsURL: T }, U) {
    const O = ({ chars: C, fonts: y }) => {
      let M, L;
      const ee = [];
      for (let x = 0; x < C.length; x++)
        C[x] !== L ? (L = C[x], ee.push(M = { start: x, end: x, fontObj: y[C[x]] })) : M.end = x;
      U(ee);
    };
    k ? O(k) : o(
      g,
      O,
      { lang: S, fonts: w, style: I, weight: A, unicodeFontsURL: T }
    );
  }
  function s({
    text: g = "",
    font: S,
    lang: w,
    sdfGlyphSize: I = 64,
    fontSize: A = 400,
    fontWeight: k = 1,
    fontStyle: T = "normal",
    letterSpacing: U = 0,
    lineHeight: O = "normal",
    maxWidth: C = 1 / 0,
    direction: y,
    textAlign: M = "left",
    textIndent: L = 0,
    whiteSpace: ee = "normal",
    overflowWrap: x = "normal",
    anchorX: R = 0,
    anchorY: b = 0,
    metricsOnly: K = !1,
    unicodeFontsURL: H,
    preResolvedFonts: se = null,
    includeCaretPositions: he = !1,
    chunkedBoundsSize: Z = 8192,
    colorRanges: G = null
  }, _) {
    const E = h(), D = { fontLoad: 0, typesetting: 0 };
    g.indexOf("\r") > -1 && (console.info("Typesetter: got text with \\r chars; normalizing to \\n"), g = g.replace(/\r\n/g, `
`).replace(/\r/g, `
`)), A = +A, U = +U, C = +C, O = O || "normal", L = +L, n({
      text: g,
      lang: w,
      style: T,
      weight: k,
      fonts: typeof S == "string" ? [{ src: S }] : S,
      unicodeFontsURL: H,
      preResolvedFonts: se
    }, (N) => {
      D.fontLoad = h() - E;
      const B = isFinite(C);
      let V = null, j = null, Y = null, ue = null, ve = null, oe = null, $ = null, Fe = null, Te = 0, fe = 0, ge = ee !== "nowrap";
      const Ee = /* @__PURE__ */ new Map(), te = h();
      let me = L, de = 0, q = new d();
      const Ae = [q];
      N.forEach((ye) => {
        const { fontObj: _e } = ye, { ascender: Se, descender: ke, unitsPerEm: Je, lineGap: tr, capHeight: Re, xHeight: Me } = _e;
        let be = Ee.get(_e);
        if (!be) {
          const X = A / Je, Ne = O === "normal" ? (Se - ke + tr) * X : O * A, Lr = (Ne - (Se - ke) * X) / 2, Ze = Math.min(Ne, (Se - ke) * X), Pe = (Se + ke) / 2 * X + Ze / 2;
          be = {
            index: Ee.size,
            src: _e.src,
            fontObj: _e,
            fontSizeMult: X,
            unitsPerEm: Je,
            ascender: Se * X,
            descender: ke * X,
            capHeight: Re * X,
            xHeight: Me * X,
            lineHeight: Ne,
            baseline: -Lr - Se * X,
            // baseline offset from top of line height
            // cap: -halfLeading - capHeight * fontSizeMult, // cap from top of line height
            // ex: -halfLeading - xHeight * fontSizeMult, // ex from top of line height
            caretTop: Pe,
            caretBottom: Pe - Ze
          }, Ee.set(_e, be);
        }
        const { fontSizeMult: Ye } = be, Ge = g.slice(ye.start, ye.end + 1);
        let We, Qe;
        _e.forEachGlyph(Ge, A, U, (X, Ne, Lr, Ze) => {
          Ne += de, Ze += ye.start, We = Ne, Qe = X;
          const Pe = g.charAt(Ze), ir = X.advanceWidth * Ye, er = q.count;
          let De;
          if ("isEmpty" in X || (X.isWhitespace = !!Pe && new RegExp(t).test(Pe), X.canBreakAfter = !!Pe && e.test(Pe), X.isEmpty = X.xMin === X.xMax || X.yMin === X.yMax || c.test(Pe)), !X.isWhitespace && !X.isEmpty && fe++, ge && B && !X.isWhitespace && Ne + ir + me > C && er) {
            if (q.glyphAt(er - 1).glyphObj.canBreakAfter)
              De = new d(), me = -Ne;
            else
              for (let pr = er; pr--; )
                if (pr === 0 && x === "break-word") {
                  De = new d(), me = -Ne;
                  break;
                } else if (q.glyphAt(pr).glyphObj.canBreakAfter) {
                  De = q.splitAt(pr + 1);
                  const hr = De.glyphAt(0).x;
                  me -= hr;
                  for (let sr = De.count; sr--; )
                    De.glyphAt(sr).x -= hr;
                  break;
                }
            De && (q.isSoftWrapped = !0, q = De, Ae.push(q), Te = C);
          }
          let rr = q.glyphAt(q.count);
          rr.glyphObj = X, rr.x = Ne + me, rr.y = Lr, rr.width = ir, rr.charIndex = Ze, rr.fontData = be, Pe === `
` && (q = new d(), Ae.push(q), me = -(Ne + ir + U * A) + L);
        }), de = We + Qe.advanceWidth * Ye + U * A;
      });
      let ce = 0;
      Ae.forEach((ye) => {
        let _e = !0;
        for (let Se = ye.count; Se--; ) {
          const ke = ye.glyphAt(Se);
          _e && !ke.glyphObj.isWhitespace && (ye.width = ke.x + ke.width, ye.width > Te && (Te = ye.width), _e = !1);
          let { lineHeight: Je, capHeight: tr, xHeight: Re, baseline: Me } = ke.fontData;
          Je > ye.lineHeight && (ye.lineHeight = Je);
          const be = Me - ye.baseline;
          be < 0 && (ye.baseline += be, ye.cap += be, ye.ex += be), ye.cap = Math.max(ye.cap, ye.baseline + tr), ye.ex = Math.max(ye.ex, ye.baseline + Re);
        }
        ye.baseline -= ce, ye.cap -= ce, ye.ex -= ce, ce += ye.lineHeight;
      });
      let xe = 0, le = 0;
      if (R && (typeof R == "number" ? xe = -R : typeof R == "string" && (xe = -Te * (R === "left" ? 0 : R === "center" ? 0.5 : R === "right" ? 1 : i(R)))), b && (typeof b == "number" ? le = -b : typeof b == "string" && (le = b === "top" ? 0 : b === "top-baseline" ? -Ae[0].baseline : b === "top-cap" ? -Ae[0].cap : b === "top-ex" ? -Ae[0].ex : b === "middle" ? ce / 2 : b === "bottom" ? ce : b === "bottom-baseline" ? -Ae[Ae.length - 1].baseline : i(b) * ce)), !K) {
        const ye = r.getEmbeddingLevels(g, y);
        V = new Uint16Array(fe), j = new Uint8Array(fe), Y = new Float32Array(fe * 2), ue = {}, $ = [1 / 0, 1 / 0, -1 / 0, -1 / 0], Fe = [], he && (oe = new Float32Array(g.length * 4)), G && (ve = new Uint8Array(fe * 3));
        let _e = 0, Se = -1, ke = -1, Je, tr;
        if (Ae.forEach((Re, Me) => {
          let { count: be, width: Ye } = Re;
          if (be > 0) {
            let Ge = 0;
            for (let Ze = be; Ze-- && Re.glyphAt(Ze).glyphObj.isWhitespace; )
              Ge++;
            let We = 0, Qe = 0;
            if (M === "center")
              We = (Te - Ye) / 2;
            else if (M === "right")
              We = Te - Ye;
            else if (M === "justify" && Re.isSoftWrapped) {
              let Ze = 0;
              for (let Pe = be - Ge; Pe--; )
                Re.glyphAt(Pe).glyphObj.isWhitespace && Ze++;
              Qe = (Te - Ye) / Ze;
            }
            if (Qe || We) {
              let Ze = 0;
              for (let Pe = 0; Pe < be; Pe++) {
                let ir = Re.glyphAt(Pe);
                const er = ir.glyphObj;
                ir.x += We + Ze, Qe !== 0 && er.isWhitespace && Pe < be - Ge && (Ze += Qe, ir.width += Qe);
              }
            }
            const X = r.getReorderSegments(
              g,
              ye,
              Re.glyphAt(0).charIndex,
              Re.glyphAt(Re.count - 1).charIndex
            );
            for (let Ze = 0; Ze < X.length; Ze++) {
              const [Pe, ir] = X[Ze];
              let er = 1 / 0, De = -1 / 0;
              for (let rr = 0; rr < be; rr++)
                if (Re.glyphAt(rr).charIndex >= Pe) {
                  let pr = rr, hr = rr;
                  for (; hr < be; hr++) {
                    let sr = Re.glyphAt(hr);
                    if (sr.charIndex > ir)
                      break;
                    hr < be - Ge && (er = Math.min(er, sr.x), De = Math.max(De, sr.x + sr.width));
                  }
                  for (let sr = pr; sr < hr; sr++) {
                    const Sr = Re.glyphAt(sr);
                    Sr.x = De - (Sr.x + Sr.width - er);
                  }
                  break;
                }
            }
            let Ne;
            const Lr = (Ze) => Ne = Ze;
            for (let Ze = 0; Ze < be; Ze++) {
              const Pe = Re.glyphAt(Ze);
              Ne = Pe.glyphObj;
              const ir = Ne.index, er = ye.levels[Pe.charIndex] & 1;
              if (er) {
                const De = r.getMirroredCharacter(g[Pe.charIndex]);
                De && Pe.fontData.fontObj.forEachGlyph(De, 0, 0, Lr);
              }
              if (he) {
                const { charIndex: De, fontData: rr } = Pe, pr = Pe.x + xe, hr = Pe.x + Pe.width + xe;
                oe[De * 4] = er ? hr : pr, oe[De * 4 + 1] = er ? pr : hr, oe[De * 4 + 2] = Re.baseline + rr.caretBottom + le, oe[De * 4 + 3] = Re.baseline + rr.caretTop + le;
                const sr = De - Se;
                sr > 1 && l(oe, Se, sr), Se = De;
              }
              if (G) {
                const { charIndex: De } = Pe;
                for (; De > ke; )
                  ke++, G.hasOwnProperty(ke) && (tr = G[ke]);
              }
              if (!Ne.isWhitespace && !Ne.isEmpty) {
                const De = _e++, { fontSizeMult: rr, src: pr, index: hr } = Pe.fontData, sr = ue[pr] || (ue[pr] = {});
                sr[ir] || (sr[ir] = {
                  path: Ne.path,
                  pathBounds: [Ne.xMin, Ne.yMin, Ne.xMax, Ne.yMax]
                });
                const Sr = Pe.x + xe, br = Pe.y + Re.baseline + le;
                Y[De * 2] = Sr, Y[De * 2 + 1] = br;
                const kr = Sr + Ne.xMin * rr, yr = br + Ne.yMin * rr, Er = Sr + Ne.xMax * rr, Ce = br + Ne.yMax * rr;
                kr < $[0] && ($[0] = kr), yr < $[1] && ($[1] = yr), Er > $[2] && ($[2] = Er), Ce > $[3] && ($[3] = Ce), De % Z === 0 && (Je = { start: De, end: De, rect: [1 / 0, 1 / 0, -1 / 0, -1 / 0] }, Fe.push(Je)), Je.end++;
                const dr = Je.rect;
                if (kr < dr[0] && (dr[0] = kr), yr < dr[1] && (dr[1] = yr), Er > dr[2] && (dr[2] = Er), Ce > dr[3] && (dr[3] = Ce), V[De] = ir, j[De] = hr, G) {
                  const Br = De * 3;
                  ve[Br] = tr >> 16 & 255, ve[Br + 1] = tr >> 8 & 255, ve[Br + 2] = tr & 255;
                }
              }
            }
          }
        }), oe) {
          const Re = g.length - Se;
          Re > 1 && l(oe, Se, Re);
        }
      }
      const ze = [];
      Ee.forEach(({ index: ye, src: _e, unitsPerEm: Se, ascender: ke, descender: Je, lineHeight: tr, capHeight: Re, xHeight: Me }) => {
        ze[ye] = { src: _e, unitsPerEm: Se, ascender: ke, descender: Je, lineHeight: tr, capHeight: Re, xHeight: Me };
      }), D.typesetting = h() - te, _({
        glyphIds: V,
        //id for each glyph, specific to that glyph's font
        glyphFontIndices: j,
        //index into fontData for each glyph
        glyphPositions: Y,
        //x,y of each glyph's origin in layout
        glyphData: ue,
        //dict holding data about each glyph appearing in the text
        fontData: ze,
        //data about each font used in the text
        caretPositions: oe,
        //startX,endX,bottomY caret positions for each char
        // caretHeight, //height of cursor from bottom to top - todo per glyph?
        glyphColors: ve,
        //color for each glyph, if color ranges supplied
        chunkedBounds: Fe,
        //total rects per (n=chunkedBoundsSize) consecutive glyphs
        fontSize: A,
        //calculated em height
        topBaseline: le + Ae[0].baseline,
        //y coordinate of the top line's baseline
        blockBounds: [
          //bounds for the whole block of text, including vertical padding for lineHeight
          xe,
          le - ce,
          xe + Te,
          le
        ],
        visibleBounds: $,
        //total bounds of visible text paths, may be larger or smaller than blockBounds
        timings: D
      });
    });
  }
  function a(g, S) {
    s({ ...g, metricsOnly: !0 }, (w) => {
      const [I, A, k, T] = w.blockBounds;
      S({
        width: k - I,
        height: T - A
      });
    });
  }
  function i(g) {
    let S = g.match(/^([\d.]+)%$/), w = S ? parseFloat(S[1]) : NaN;
    return isNaN(w) ? 0 : w / 100;
  }
  function l(g, S, w) {
    const I = g[S * 4], A = g[S * 4 + 1], k = g[S * 4 + 2], T = g[S * 4 + 3], U = (A - I) / w;
    for (let O = 0; O < w; O++) {
      const C = (S + O) * 4;
      g[C] = I + U * O, g[C + 1] = I + U * (O + 1), g[C + 2] = k, g[C + 3] = T;
    }
  }
  function h() {
    return (self.performance || Date).now();
  }
  function d() {
    this.data = [];
  }
  const p = ["glyphObj", "x", "y", "width", "charIndex", "fontData"];
  return d.prototype = {
    width: 0,
    lineHeight: 0,
    baseline: 0,
    cap: 0,
    ex: 0,
    isSoftWrapped: !1,
    get count() {
      return Math.ceil(this.data.length / p.length);
    },
    glyphAt(g) {
      let S = d.flyweight;
      return S.data = this.data, S.index = g, S;
    },
    splitAt(g) {
      let S = new d();
      return S.data = this.data.splice(g * p.length), S;
    }
  }, d.flyweight = p.reduce((g, S, w, I) => (Object.defineProperty(g, S, {
    get() {
      return this.data[this.index * p.length + w];
    },
    set(A) {
      this.data[this.index * p.length + w] = A;
    }
  }), g), { data: null, index: 0 }), {
    typeset: s,
    measure: a
  };
}
const Kr = () => (self.performance || Date).now(), Yt = /* @__PURE__ */ Qa();
let ha;
function gs(o, r, u, c, t, e, n, s, a, i, l = !0) {
  return l ? ys(o, r, u, c, t, e, n, s, a, i).then(
    null,
    (h) => (ha || (console.warn("WebGL SDF generation failed, falling back to JS", h), ha = !0), va(o, r, u, c, t, e, n, s, a, i))
  ) : va(o, r, u, c, t, e, n, s, a, i);
}
const Bt = [], ms = 5;
let xn = 0;
function eo() {
  const o = Kr();
  for (; Bt.length && Kr() - o < ms; )
    Bt.shift()();
  xn = Bt.length ? setTimeout(eo, 0) : 0;
}
const ys = (...o) => new Promise((r, u) => {
  Bt.push(() => {
    const c = Kr();
    try {
      Yt.webgl.generateIntoCanvas(...o), r({ timing: Kr() - c });
    } catch (t) {
      u(t);
    }
  }), xn || (xn = setTimeout(eo, 0));
}), _s = 4, ws = 2e3, da = {};
let xs = 0;
function va(o, r, u, c, t, e, n, s, a, i) {
  const l = "TroikaTextSDFGenerator_JS_" + xs++ % _s;
  let h = da[l];
  return h || (h = da[l] = {
    workerModule: nt({
      name: l,
      workerId: l,
      dependencies: [
        Qa,
        Kr
      ],
      init(d, p) {
        const g = d().javascript.generate;
        return function(...S) {
          const w = p();
          return {
            textureData: g(...S),
            timing: p() - w
          };
        };
      },
      getTransferables(d) {
        return [d.textureData.buffer];
      }
    }),
    requests: 0,
    idleTimer: null
  }), h.requests++, clearTimeout(h.idleTimer), h.workerModule(o, r, u, c, t, e).then(({ textureData: d, timing: p }) => {
    const g = Kr(), S = new Uint8Array(d.length * 4);
    for (let w = 0; w < d.length; w++)
      S[w * 4 + i] = d[w];
    return Yt.webglUtils.renderImageData(n, S, s, a, o, r, 1 << 3 - i), p += Kr() - g, --h.requests === 0 && (h.idleTimer = setTimeout(() => {
      Qi(l);
    }, ws)), { timing: p };
  });
}
function Ss(o) {
  o._warm || (Yt.webgl.isSupported(o), o._warm = !0);
}
const bs = Yt.webglUtils.resizeWebGLCanvasWithoutClearing, vt = {
  unicodeFontsURL: null,
  sdfGlyphSize: 64,
  sdfMargin: 1 / 16,
  sdfExponent: 9,
  textureWidth: 2048
}, Es = /* @__PURE__ */ new tt();
function $r() {
  return (self.performance || Date).now();
}
const pa = /* @__PURE__ */ Object.create(null);
function ro(o, r) {
  o = Us({}, o);
  const u = $r(), c = [];
  if (o.font && c.push({ label: "user", src: Cs(o.font) }), o.font = c, o.text = "" + o.text, o.sdfGlyphSize = o.sdfGlyphSize || vt.sdfGlyphSize, o.unicodeFontsURL = o.unicodeFontsURL || vt.unicodeFontsURL, o.colorRanges != null) {
    let d = {};
    for (let p in o.colorRanges)
      if (o.colorRanges.hasOwnProperty(p)) {
        let g = o.colorRanges[p];
        typeof g != "number" && (g = Es.set(g).getHex()), d[p] = g;
      }
    o.colorRanges = d;
  }
  Object.freeze(o);
  const { textureWidth: t, sdfExponent: e } = vt, { sdfGlyphSize: n } = o, s = t / n * 4;
  let a = pa[n];
  if (!a) {
    const d = document.createElement("canvas");
    d.width = t, d.height = n * 256 / s, a = pa[n] = {
      glyphCount: 0,
      sdfGlyphSize: n,
      sdfCanvas: d,
      sdfTexture: new Yr(
        d,
        void 0,
        void 0,
        void 0,
        Ur,
        Ur
      ),
      contextLost: !1,
      glyphsByFont: /* @__PURE__ */ new Map()
    }, a.sdfTexture.generateMipmaps = !1, Ms(a);
  }
  const { sdfTexture: i, sdfCanvas: l } = a;
  ao(o).then((d) => {
    const { glyphIds: p, glyphFontIndices: g, fontData: S, glyphPositions: w, fontSize: I, timings: A } = d, k = [], T = new Float32Array(p.length * 4);
    let U = 0, O = 0;
    const C = $r(), y = S.map((R) => {
      let b = a.glyphsByFont.get(R.src);
      return b || a.glyphsByFont.set(R.src, b = /* @__PURE__ */ new Map()), b;
    });
    p.forEach((R, b) => {
      const K = g[b], { src: H, unitsPerEm: se } = S[K];
      let he = y[K].get(R);
      if (!he) {
        const { path: D, pathBounds: N } = d.glyphData[H][R], B = Math.max(N[2] - N[0], N[3] - N[1]) / n * (vt.sdfMargin * n + 0.5), V = a.glyphCount++, j = [
          N[0] - B,
          N[1] - B,
          N[2] + B,
          N[3] + B
        ];
        y[K].set(R, he = { path: D, atlasIndex: V, sdfViewBox: j }), k.push(he);
      }
      const { sdfViewBox: Z } = he, G = w[O++], _ = w[O++], E = I / se;
      T[U++] = G + Z[0] * E, T[U++] = _ + Z[1] * E, T[U++] = G + Z[2] * E, T[U++] = _ + Z[3] * E, p[b] = he.atlasIndex;
    }), A.quads = (A.quads || 0) + ($r() - C);
    const M = $r();
    A.sdf = {};
    const L = l.height, ee = Math.ceil(a.glyphCount / s), x = Math.pow(2, Math.ceil(Math.log2(ee * n)));
    x > L && (console.info(`Increasing SDF texture size ${L}->${x}`), bs(l, t, x), i.dispose()), Promise.all(k.map(
      (R) => to(R, a, o.gpuAccelerateSDF).then(({ timing: b }) => {
        A.sdf[R.atlasIndex] = b;
      })
    )).then(() => {
      k.length && !a.contextLost && (no(a), i.needsUpdate = !0), A.sdfTotal = $r() - M, A.total = $r() - u, r(Object.freeze({
        parameters: o,
        sdfTexture: i,
        sdfGlyphSize: n,
        sdfExponent: e,
        glyphBounds: T,
        glyphAtlasIndices: p,
        glyphColors: d.glyphColors,
        caretPositions: d.caretPositions,
        chunkedBounds: d.chunkedBounds,
        ascender: d.ascender,
        descender: d.descender,
        lineHeight: d.lineHeight,
        capHeight: d.capHeight,
        xHeight: d.xHeight,
        topBaseline: d.topBaseline,
        blockBounds: d.blockBounds,
        visibleBounds: d.visibleBounds,
        timings: d.timings
      }));
    });
  }), Promise.resolve().then(() => {
    a.contextLost || Ss(l);
  });
}
function to({ path: o, atlasIndex: r, sdfViewBox: u }, { sdfGlyphSize: c, sdfCanvas: t, contextLost: e }, n) {
  if (e)
    return Promise.resolve({ timing: -1 });
  const { textureWidth: s, sdfExponent: a } = vt, i = Math.max(u[2] - u[0], u[3] - u[1]), l = Math.floor(r / 4), h = l % (s / c) * c, d = Math.floor(l / (s / c)) * c, p = r % 4;
  return gs(c, c, o, u, i, a, t, h, d, p, n);
}
function Ms(o) {
  const r = o.sdfCanvas;
  r.addEventListener("webglcontextlost", (u) => {
    console.log("Context Lost", u), u.preventDefault(), o.contextLost = !0;
  }), r.addEventListener("webglcontextrestored", (u) => {
    console.log("Context Restored", u), o.contextLost = !1;
    const c = [];
    o.glyphsByFont.forEach((t) => {
      t.forEach((e) => {
        c.push(to(e, o, !0));
      });
    }), Promise.all(c).then(() => {
      no(o), o.sdfTexture.needsUpdate = !0;
    });
  });
}
function Ts({ font: o, characters: r, sdfGlyphSize: u }, c) {
  let t = Array.isArray(r) ? r.join(`
`) : "" + r;
  ro({ font: o, sdfGlyphSize: u, text: t }, c);
}
function Us(o, r) {
  for (let u in r)
    r.hasOwnProperty(u) && (o[u] = r[u]);
  return o;
}
let Dt;
function Cs(o) {
  return Dt || (Dt = typeof document > "u" ? {} : document.createElement("a")), Dt.href = o, Dt.href;
}
function no(o) {
  if (typeof createImageBitmap != "function") {
    console.info("Safari<15: applying SDF canvas workaround");
    const { sdfCanvas: r, sdfTexture: u } = o, { width: c, height: t } = r, e = o.sdfCanvas.getContext("webgl");
    let n = u.image.data;
    (!n || n.length !== c * t * 4) && (n = new Uint8Array(c * t * 4), u.image = { width: c, height: t, data: n }, u.flipY = !1, u.isDataTexture = !0), e.readPixels(0, 0, c, t, e.RGBA, e.UNSIGNED_BYTE, n);
  }
}
const As = /* @__PURE__ */ nt({
  name: "Typesetter",
  dependencies: [
    ps,
    vs,
    es
  ],
  init(o, r, u) {
    return o(r, u());
  }
}), ao = /* @__PURE__ */ nt({
  name: "Typesetter",
  dependencies: [
    As
  ],
  init(o) {
    return function(r) {
      return new Promise((u) => {
        o.typeset(r, u);
      });
    };
  },
  getTransferables(o) {
    const r = [];
    for (let u in o)
      o[u] && o[u].buffer && r.push(o[u].buffer);
    return r;
  }
});
ao.onMainThread;
const ga = {};
function Fs(o) {
  let r = ga[o];
  return r || (r = ga[o] = new St(1, 1, o, o).translate(0.5, 0.5, 0)), r;
}
const ks = "aTroikaGlyphBounds", ma = "aTroikaGlyphIndex", Rs = "aTroikaGlyphColor";
class Ds extends Lo {
  constructor() {
    super(), this.detail = 1, this.curveRadius = 0, this.groups = [
      { start: 0, count: 1 / 0, materialIndex: 0 },
      { start: 0, count: 1 / 0, materialIndex: 1 }
    ], this.boundingSphere = new Po(), this.boundingBox = new Bo();
  }
  computeBoundingSphere() {
  }
  computeBoundingBox() {
  }
  set detail(r) {
    if (r !== this._detail) {
      this._detail = r, (typeof r != "number" || r < 1) && (r = 1);
      let u = Fs(r);
      ["position", "normal", "uv"].forEach((c) => {
        this.attributes[c] = u.attributes[c].clone();
      }), this.setIndex(u.getIndex().clone());
    }
  }
  get detail() {
    return this._detail;
  }
  set curveRadius(r) {
    r !== this._curveRadius && (this._curveRadius = r, this._updateBounds());
  }
  get curveRadius() {
    return this._curveRadius;
  }
  /**
   * Update the geometry for a new set of glyphs.
   * @param {Float32Array} glyphBounds - An array holding the planar bounds for all glyphs
   *        to be rendered, 4 entries for each glyph: x1,x2,y1,y1
   * @param {Float32Array} glyphAtlasIndices - An array holding the index of each glyph within
   *        the SDF atlas texture.
   * @param {Array} blockBounds - An array holding the [minX, minY, maxX, maxY] across all glyphs
   * @param {Array} [chunkedBounds] - An array of objects describing bounds for each chunk of N
   *        consecutive glyphs: `{start:N, end:N, rect:[minX, minY, maxX, maxY]}`. This can be
   *        used with `applyClipRect` to choose an optimized `instanceCount`.
   * @param {Uint8Array} [glyphColors] - An array holding r,g,b values for each glyph.
   */
  updateGlyphs(r, u, c, t, e) {
    this.updateAttributeData(ks, r, 4), this.updateAttributeData(ma, u, 1), this.updateAttributeData(Rs, e, 3), this._blockBounds = c, this._chunkedBounds = t, this.instanceCount = u.length, this._updateBounds();
  }
  _updateBounds() {
    const r = this._blockBounds;
    if (r) {
      const { curveRadius: u, boundingBox: c } = this;
      if (u) {
        const { PI: t, floor: e, min: n, max: s, sin: a, cos: i } = Math, l = t / 2, h = t * 2, d = Math.abs(u), p = r[0] / d, g = r[2] / d, S = e((p + l) / h) !== e((g + l) / h) ? -d : n(a(p) * d, a(g) * d), w = e((p - l) / h) !== e((g - l) / h) ? d : s(a(p) * d, a(g) * d), I = e((p + t) / h) !== e((g + t) / h) ? d * 2 : s(d - i(p) * d, d - i(g) * d);
        c.min.set(S, r[1], u < 0 ? -I : 0), c.max.set(w, r[3], u < 0 ? 0 : I);
      } else
        c.min.set(r[0], r[1], 0), c.max.set(r[2], r[3], 0);
      c.getBoundingSphere(this.boundingSphere);
    }
  }
  /**
   * Given a clipping rect, and the chunkedBounds from the last updateGlyphs call, choose the lowest
   * `instanceCount` that will show all glyphs within the clipped view. This is an optimization
   * for long blocks of text that are clipped, to skip vertex shader evaluation for glyphs that would
   * be clipped anyway.
   *
   * Note that since `drawElementsInstanced[ANGLE]` only accepts an instance count and not a starting
   * offset, this optimization becomes less effective as the clipRect moves closer to the end of the
   * text block. We could fix that by switching from instancing to a full geometry with a drawRange,
   * but at the expense of much larger attribute buffers (see classdoc above.)
   *
   * @param {Vector4} clipRect
   */
  applyClipRect(r) {
    let u = this.getAttribute(ma).count, c = this._chunkedBounds;
    if (c)
      for (let t = c.length; t--; ) {
        u = c[t].end;
        let e = c[t].rect;
        if (e[1] < r.w && e[3] > r.y && e[0] < r.z && e[2] > r.x)
          break;
      }
    this.instanceCount = u;
  }
  /**
   * Utility for updating instance attributes with automatic resizing
   */
  updateAttributeData(r, u, c) {
    const t = this.getAttribute(r);
    u ? t && t.array.length === u.length ? (t.array.set(u), t.needsUpdate = !0) : (this.setAttribute(r, new Go(u, c)), delete this._maxInstanceCount, this.dispose()) : t && this.deleteAttribute(r);
  }
}
const Is = `
uniform vec2 uTroikaSDFTextureSize;
uniform float uTroikaSDFGlyphSize;
uniform vec4 uTroikaTotalBounds;
uniform vec4 uTroikaClipRect;
uniform mat3 uTroikaOrient;
uniform bool uTroikaUseGlyphColors;
uniform float uTroikaEdgeOffset;
uniform float uTroikaBlurRadius;
uniform vec2 uTroikaPositionOffset;
uniform float uTroikaCurveRadius;
attribute vec4 aTroikaGlyphBounds;
attribute float aTroikaGlyphIndex;
attribute vec3 aTroikaGlyphColor;
varying vec2 vTroikaGlyphUV;
varying vec4 vTroikaTextureUVBounds;
varying float vTroikaTextureChannel;
varying vec3 vTroikaGlyphColor;
varying vec2 vTroikaGlyphDimensions;
`, Os = `
vec4 bounds = aTroikaGlyphBounds;
bounds.xz += uTroikaPositionOffset.x;
bounds.yw -= uTroikaPositionOffset.y;

vec4 outlineBounds = vec4(
  bounds.xy - uTroikaEdgeOffset - uTroikaBlurRadius,
  bounds.zw + uTroikaEdgeOffset + uTroikaBlurRadius
);
vec4 clippedBounds = vec4(
  clamp(outlineBounds.xy, uTroikaClipRect.xy, uTroikaClipRect.zw),
  clamp(outlineBounds.zw, uTroikaClipRect.xy, uTroikaClipRect.zw)
);

vec2 clippedXY = (mix(clippedBounds.xy, clippedBounds.zw, position.xy) - bounds.xy) / (bounds.zw - bounds.xy);

position.xy = mix(bounds.xy, bounds.zw, clippedXY);

uv = (position.xy - uTroikaTotalBounds.xy) / (uTroikaTotalBounds.zw - uTroikaTotalBounds.xy);

float rad = uTroikaCurveRadius;
if (rad != 0.0) {
  float angle = position.x / rad;
  position.xz = vec2(sin(angle) * rad, rad - cos(angle) * rad);
  normal.xz = vec2(sin(angle), cos(angle));
}
  
position = uTroikaOrient * position;
normal = uTroikaOrient * normal;

vTroikaGlyphUV = clippedXY.xy;
vTroikaGlyphDimensions = vec2(bounds[2] - bounds[0], bounds[3] - bounds[1]);


float txCols = uTroikaSDFTextureSize.x / uTroikaSDFGlyphSize;
vec2 txUvPerSquare = uTroikaSDFGlyphSize / uTroikaSDFTextureSize;
vec2 txStartUV = txUvPerSquare * vec2(
  mod(floor(aTroikaGlyphIndex / 4.0), txCols),
  floor(floor(aTroikaGlyphIndex / 4.0) / txCols)
);
vTroikaTextureUVBounds = vec4(txStartUV, vec2(txStartUV) + txUvPerSquare);
vTroikaTextureChannel = mod(aTroikaGlyphIndex, 4.0);
`, Ls = `
uniform sampler2D uTroikaSDFTexture;
uniform vec2 uTroikaSDFTextureSize;
uniform float uTroikaSDFGlyphSize;
uniform float uTroikaSDFExponent;
uniform float uTroikaEdgeOffset;
uniform float uTroikaFillOpacity;
uniform float uTroikaBlurRadius;
uniform vec3 uTroikaStrokeColor;
uniform float uTroikaStrokeWidth;
uniform float uTroikaStrokeOpacity;
uniform bool uTroikaSDFDebug;
varying vec2 vTroikaGlyphUV;
varying vec4 vTroikaTextureUVBounds;
varying float vTroikaTextureChannel;
varying vec2 vTroikaGlyphDimensions;

float troikaSdfValueToSignedDistance(float alpha) {
  // Inverse of exponential encoding in webgl-sdf-generator
  
  float maxDimension = max(vTroikaGlyphDimensions.x, vTroikaGlyphDimensions.y);
  float absDist = (1.0 - pow(2.0 * (alpha > 0.5 ? 1.0 - alpha : alpha), 1.0 / uTroikaSDFExponent)) * maxDimension;
  float signedDist = absDist * (alpha > 0.5 ? -1.0 : 1.0);
  return signedDist;
}

float troikaGlyphUvToSdfValue(vec2 glyphUV) {
  vec2 textureUV = mix(vTroikaTextureUVBounds.xy, vTroikaTextureUVBounds.zw, glyphUV);
  vec4 rgba = texture2D(uTroikaSDFTexture, textureUV);
  float ch = floor(vTroikaTextureChannel + 0.5); //NOTE: can't use round() in WebGL1
  return ch == 0.0 ? rgba.r : ch == 1.0 ? rgba.g : ch == 2.0 ? rgba.b : rgba.a;
}

float troikaGlyphUvToDistance(vec2 uv) {
  return troikaSdfValueToSignedDistance(troikaGlyphUvToSdfValue(uv));
}

float troikaGetAADist() {
  
  #if defined(GL_OES_standard_derivatives) || __VERSION__ >= 300
  return length(fwidth(vTroikaGlyphUV * vTroikaGlyphDimensions)) * 0.5;
  #else
  return vTroikaGlyphDimensions.x / 64.0;
  #endif
}

float troikaGetFragDistValue() {
  vec2 clampedGlyphUV = clamp(vTroikaGlyphUV, 0.5 / uTroikaSDFGlyphSize, 1.0 - 0.5 / uTroikaSDFGlyphSize);
  float distance = troikaGlyphUvToDistance(clampedGlyphUV);
 
  // Extrapolate distance when outside bounds:
  distance += clampedGlyphUV == vTroikaGlyphUV ? 0.0 : 
    length((vTroikaGlyphUV - clampedGlyphUV) * vTroikaGlyphDimensions);

  

  return distance;
}

float troikaGetEdgeAlpha(float distance, float distanceOffset, float aaDist) {
  #if defined(IS_DEPTH_MATERIAL) || defined(IS_DISTANCE_MATERIAL)
  float alpha = step(-distanceOffset, -distance);
  #else

  float alpha = smoothstep(
    distanceOffset + aaDist,
    distanceOffset - aaDist,
    distance
  );
  #endif

  return alpha;
}
`, Ps = `
float aaDist = troikaGetAADist();
float fragDistance = troikaGetFragDistValue();
float edgeAlpha = uTroikaSDFDebug ?
  troikaGlyphUvToSdfValue(vTroikaGlyphUV) :
  troikaGetEdgeAlpha(fragDistance, uTroikaEdgeOffset, max(aaDist, uTroikaBlurRadius));

#if !defined(IS_DEPTH_MATERIAL) && !defined(IS_DISTANCE_MATERIAL)
vec4 fillRGBA = gl_FragColor;
fillRGBA.a *= uTroikaFillOpacity;
vec4 strokeRGBA = uTroikaStrokeWidth == 0.0 ? fillRGBA : vec4(uTroikaStrokeColor, uTroikaStrokeOpacity);
if (fillRGBA.a == 0.0) fillRGBA.rgb = strokeRGBA.rgb;
gl_FragColor = mix(fillRGBA, strokeRGBA, smoothstep(
  -uTroikaStrokeWidth - aaDist,
  -uTroikaStrokeWidth + aaDist,
  fragDistance
));
gl_FragColor.a *= edgeAlpha;
#endif

if (edgeAlpha == 0.0) {
  discard;
}
`;
function Bs(o) {
  const r = wn(o, {
    chained: !0,
    extensions: {
      derivatives: !0
    },
    uniforms: {
      uTroikaSDFTexture: { value: null },
      uTroikaSDFTextureSize: { value: new Gt() },
      uTroikaSDFGlyphSize: { value: 0 },
      uTroikaSDFExponent: { value: 0 },
      uTroikaTotalBounds: { value: new na(0, 0, 0, 0) },
      uTroikaClipRect: { value: new na(0, 0, 0, 0) },
      uTroikaEdgeOffset: { value: 0 },
      uTroikaFillOpacity: { value: 1 },
      uTroikaPositionOffset: { value: new Gt() },
      uTroikaCurveRadius: { value: 0 },
      uTroikaBlurRadius: { value: 0 },
      uTroikaStrokeWidth: { value: 0 },
      uTroikaStrokeColor: { value: new tt() },
      uTroikaStrokeOpacity: { value: 1 },
      uTroikaOrient: { value: new No() },
      uTroikaUseGlyphColors: { value: !0 },
      uTroikaSDFDebug: { value: !1 }
    },
    vertexDefs: Is,
    vertexTransform: Os,
    fragmentDefs: Ls,
    fragmentColorTransform: Ps,
    customRewriter({ vertexShader: u, fragmentShader: c }) {
      let t = /\buniform\s+vec3\s+diffuse\b/;
      return t.test(c) && (c = c.replace(t, "varying vec3 vTroikaGlyphColor").replace(/\bdiffuse\b/g, "vTroikaGlyphColor"), t.test(u) || (u = u.replace(
        $a,
        `uniform vec3 diffuse;
$&
vTroikaGlyphColor = uTroikaUseGlyphColors ? aTroikaGlyphColor / 255.0 : diffuse;
`
      ))), { vertexShader: u, fragmentShader: c };
    }
  });
  return r.transparent = !0, r.forceSinglePass = !0, Object.defineProperties(r, {
    isTroikaTextMaterial: { value: !0 },
    // WebGLShadowMap reverses the side of the shadow material by default, which fails
    // for planes, so here we force the `shadowSide` to always match the main side.
    shadowSide: {
      get() {
        return this.side;
      },
      set() {
      }
    }
  }), r;
}
const Rn = /* @__PURE__ */ new ka({
  color: 16777215,
  side: Vt,
  transparent: !0
}), ya = 8421504, _a = /* @__PURE__ */ new qr(), It = /* @__PURE__ */ new nr(), fn = /* @__PURE__ */ new nr(), ht = [], Gs = /* @__PURE__ */ new nr(), hn = "+x+y";
function wa(o) {
  return Array.isArray(o) ? o[0] : o;
}
let oo = () => {
  const o = new Xr(
    new St(1, 1),
    Rn
  );
  return oo = () => o, o;
}, io = () => {
  const o = new Xr(
    new St(1, 1, 32, 1),
    Rn
  );
  return io = () => o, o;
};
const Ns = { type: "syncstart" }, zs = { type: "synccomplete" }, so = [
  "font",
  "fontSize",
  "fontStyle",
  "fontWeight",
  "lang",
  "letterSpacing",
  "lineHeight",
  "maxWidth",
  "overflowWrap",
  "text",
  "direction",
  "textAlign",
  "textIndent",
  "whiteSpace",
  "anchorX",
  "anchorY",
  "colorRanges",
  "sdfGlyphSize"
], Ws = so.concat(
  "material",
  "color",
  "depthOffset",
  "clipRect",
  "curveRadius",
  "orientation",
  "glyphGeometryDetail"
);
let lo = class extends Xr {
  constructor() {
    const r = new Ds();
    super(r, null), this.text = "", this.anchorX = 0, this.anchorY = 0, this.curveRadius = 0, this.direction = "auto", this.font = null, this.unicodeFontsURL = null, this.fontSize = 0.1, this.fontWeight = "normal", this.fontStyle = "normal", this.lang = null, this.letterSpacing = 0, this.lineHeight = "normal", this.maxWidth = 1 / 0, this.overflowWrap = "normal", this.textAlign = "left", this.textIndent = 0, this.whiteSpace = "normal", this.material = null, this.color = null, this.colorRanges = null, this.outlineWidth = 0, this.outlineColor = 0, this.outlineOpacity = 1, this.outlineBlur = 0, this.outlineOffsetX = 0, this.outlineOffsetY = 0, this.strokeWidth = 0, this.strokeColor = ya, this.strokeOpacity = 1, this.fillOpacity = 1, this.depthOffset = 0, this.clipRect = null, this.orientation = hn, this.glyphGeometryDetail = 1, this.sdfGlyphSize = null, this.gpuAccelerateSDF = !0, this.debugSDF = !1;
  }
  /**
   * Updates the text rendering according to the current text-related configuration properties.
   * This is an async process, so you can pass in a callback function to be executed when it
   * finishes.
   * @param {function} [callback]
   */
  sync(r) {
    this._needsSync && (this._needsSync = !1, this._isSyncing ? (this._queuedSyncs || (this._queuedSyncs = [])).push(r) : (this._isSyncing = !0, this.dispatchEvent(Ns), ro({
      text: this.text,
      font: this.font,
      lang: this.lang,
      fontSize: this.fontSize || 0.1,
      fontWeight: this.fontWeight || "normal",
      fontStyle: this.fontStyle || "normal",
      letterSpacing: this.letterSpacing || 0,
      lineHeight: this.lineHeight || "normal",
      maxWidth: this.maxWidth,
      direction: this.direction || "auto",
      textAlign: this.textAlign,
      textIndent: this.textIndent,
      whiteSpace: this.whiteSpace,
      overflowWrap: this.overflowWrap,
      anchorX: this.anchorX,
      anchorY: this.anchorY,
      colorRanges: this.colorRanges,
      includeCaretPositions: !0,
      //TODO parameterize
      sdfGlyphSize: this.sdfGlyphSize,
      gpuAccelerateSDF: this.gpuAccelerateSDF,
      unicodeFontsURL: this.unicodeFontsURL
    }, (u) => {
      this._isSyncing = !1, this._textRenderInfo = u, this.geometry.updateGlyphs(
        u.glyphBounds,
        u.glyphAtlasIndices,
        u.blockBounds,
        u.chunkedBounds,
        u.glyphColors
      );
      const c = this._queuedSyncs;
      c && (this._queuedSyncs = null, this._needsSync = !0, this.sync(() => {
        c.forEach((t) => t && t());
      })), this.dispatchEvent(zs), r && r();
    })));
  }
  /**
   * Initiate a sync if needed - note it won't complete until next frame at the
   * earliest so if possible it's a good idea to call sync() manually as soon as
   * all the properties have been set.
   * @override
   */
  onBeforeRender(r, u, c, t, e, n) {
    this.sync(), e.isTroikaTextMaterial && this._prepareForRender(e);
  }
  /**
   * Shortcut to dispose the geometry specific to this instance.
   * Note: we don't also dispose the derived material here because if anything else is
   * sharing the same base material it will result in a pause next frame as the program
   * is recompiled. Instead users can dispose the base material manually, like normal,
   * and we'll also dispose the derived material at that time.
   */
  dispose() {
    this.geometry.dispose();
  }
  /**
   * @property {TroikaTextRenderInfo|null} textRenderInfo
   * @readonly
   * The current processed rendering data for this TextMesh, returned by the TextBuilder after
   * a `sync()` call. This will be `null` initially, and may be stale for a short period until
   * the asynchrous `sync()` process completes.
   */
  get textRenderInfo() {
    return this._textRenderInfo || null;
  }
  /**
   * Create the text derived material from the base material. Can be overridden to use a custom
   * derived material.
   */
  createDerivedMaterial(r) {
    return Bs(r);
  }
  // Handler for automatically wrapping the base material with our upgrades. We do the wrapping
  // lazily on _read_ rather than write to avoid unnecessary wrapping on transient values.
  get material() {
    let r = this._derivedMaterial;
    const u = this._baseMaterial || this._defaultMaterial || (this._defaultMaterial = Rn.clone());
    if ((!r || !r.isDerivedFrom(u)) && (r = this._derivedMaterial = this.createDerivedMaterial(u), u.addEventListener("dispose", function c() {
      u.removeEventListener("dispose", c), r.dispose();
    })), this.hasOutline()) {
      let c = r._outlineMtl;
      return c || (c = r._outlineMtl = Object.create(r, {
        id: { value: r.id + 0.1 }
      }), c.isTextOutlineMaterial = !0, c.depthWrite = !1, c.map = null, r.addEventListener("dispose", function t() {
        r.removeEventListener("dispose", t), c.dispose();
      })), [
        c,
        r
      ];
    } else
      return r;
  }
  set material(r) {
    r && r.isTroikaTextMaterial ? (this._derivedMaterial = r, this._baseMaterial = r.baseMaterial) : this._baseMaterial = r;
  }
  hasOutline() {
    return !!(this.outlineWidth || this.outlineBlur || this.outlineOffsetX || this.outlineOffsetY);
  }
  get glyphGeometryDetail() {
    return this.geometry.detail;
  }
  set glyphGeometryDetail(r) {
    this.geometry.detail = r;
  }
  get curveRadius() {
    return this.geometry.curveRadius;
  }
  set curveRadius(r) {
    this.geometry.curveRadius = r;
  }
  // Create and update material for shadows upon request:
  get customDepthMaterial() {
    return wa(this.material).getDepthMaterial();
  }
  set customDepthMaterial(r) {
  }
  get customDistanceMaterial() {
    return wa(this.material).getDistanceMaterial();
  }
  set customDistanceMaterial(r) {
  }
  _prepareForRender(r) {
    const u = r.isTextOutlineMaterial, c = r.uniforms, t = this.textRenderInfo;
    if (t) {
      const { sdfTexture: s, blockBounds: a } = t;
      c.uTroikaSDFTexture.value = s, c.uTroikaSDFTextureSize.value.set(s.image.width, s.image.height), c.uTroikaSDFGlyphSize.value = t.sdfGlyphSize, c.uTroikaSDFExponent.value = t.sdfExponent, c.uTroikaTotalBounds.value.fromArray(a), c.uTroikaUseGlyphColors.value = !u && !!t.glyphColors;
      let i = 0, l = 0, h = 0, d, p, g, S = 0, w = 0;
      if (u) {
        let { outlineWidth: A, outlineOffsetX: k, outlineOffsetY: T, outlineBlur: U, outlineOpacity: O } = this;
        i = this._parsePercent(A) || 0, l = Math.max(0, this._parsePercent(U) || 0), d = O, S = this._parsePercent(k) || 0, w = this._parsePercent(T) || 0;
      } else
        h = Math.max(0, this._parsePercent(this.strokeWidth) || 0), h && (g = this.strokeColor, c.uTroikaStrokeColor.value.set(g ?? ya), p = this.strokeOpacity, p == null && (p = 1)), d = this.fillOpacity;
      c.uTroikaEdgeOffset.value = i, c.uTroikaPositionOffset.value.set(S, w), c.uTroikaBlurRadius.value = l, c.uTroikaStrokeWidth.value = h, c.uTroikaStrokeOpacity.value = p, c.uTroikaFillOpacity.value = d ?? 1, c.uTroikaCurveRadius.value = this.curveRadius || 0;
      let I = this.clipRect;
      if (I && Array.isArray(I) && I.length === 4)
        c.uTroikaClipRect.value.fromArray(I);
      else {
        const A = (this.fontSize || 0.1) * 100;
        c.uTroikaClipRect.value.set(
          a[0] - A,
          a[1] - A,
          a[2] + A,
          a[3] + A
        );
      }
      this.geometry.applyClipRect(c.uTroikaClipRect.value);
    }
    c.uTroikaSDFDebug.value = !!this.debugSDF, r.polygonOffset = !!this.depthOffset, r.polygonOffsetFactor = r.polygonOffsetUnits = this.depthOffset || 0;
    const e = u ? this.outlineColor || 0 : this.color;
    if (e == null)
      delete r.color;
    else {
      const s = r.hasOwnProperty("color") ? r.color : r.color = new tt();
      (e !== s._input || typeof e == "object") && s.set(s._input = e);
    }
    let n = this.orientation || hn;
    if (n !== r._orientation) {
      let s = c.uTroikaOrient.value;
      n = n.replace(/[^-+xyz]/g, "");
      let a = n !== hn && n.match(/^([-+])([xyz])([-+])([xyz])$/);
      if (a) {
        let [, i, l, h, d] = a;
        It.set(0, 0, 0)[l] = i === "-" ? 1 : -1, fn.set(0, 0, 0)[d] = h === "-" ? -1 : 1, _a.lookAt(Gs, It.cross(fn), fn), s.setFromMatrix4(_a);
      } else
        s.identity();
      r._orientation = n;
    }
  }
  _parsePercent(r) {
    if (typeof r == "string") {
      let u = r.match(/^(-?[\d.]+)%$/), c = u ? parseFloat(u[1]) : NaN;
      r = (isNaN(c) ? 0 : c / 100) * this.fontSize;
    }
    return r;
  }
  /**
   * Translate a point in local space to an x/y in the text plane.
   */
  localPositionToTextCoords(r, u = new Gt()) {
    u.copy(r);
    const c = this.curveRadius;
    return c && (u.x = Math.atan2(r.x, Math.abs(c) - Math.abs(r.z)) * Math.abs(c)), u;
  }
  /**
   * Translate a point in world space to an x/y in the text plane.
   */
  worldPositionToTextCoords(r, u = new Gt()) {
    return It.copy(r), this.localPositionToTextCoords(this.worldToLocal(It), u);
  }
  /**
   * @override Custom raycasting to test against the whole text block's max rectangular bounds
   * TODO is there any reason to make this more granular, like within individual line or glyph rects?
   */
  raycast(r, u) {
    const { textRenderInfo: c, curveRadius: t } = this;
    if (c) {
      const e = c.blockBounds, n = t ? io() : oo(), s = n.geometry, { position: a, uv: i } = s.attributes;
      for (let l = 0; l < i.count; l++) {
        let h = e[0] + i.getX(l) * (e[2] - e[0]);
        const d = e[1] + i.getY(l) * (e[3] - e[1]);
        let p = 0;
        t && (p = t - Math.cos(h / t) * t, h = Math.sin(h / t) * t), a.setXYZ(l, h, d, p);
      }
      s.boundingSphere = this.geometry.boundingSphere, s.boundingBox = this.geometry.boundingBox, n.matrixWorld = this.matrixWorld, n.material.side = this.material.side, ht.length = 0, n.raycast(r, ht);
      for (let l = 0; l < ht.length; l++)
        ht[l].object = this, u.push(ht[l]);
    }
  }
  copy(r) {
    const u = this.geometry;
    return super.copy(r), this.geometry = u, Ws.forEach((c) => {
      this[c] = r[c];
    }), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
};
so.forEach((o) => {
  const r = "_private_" + o;
  Object.defineProperty(lo.prototype, o, {
    get() {
      return this[r];
    },
    set(u) {
      u !== this[r] && (this[r] = u, this._needsSync = !0);
    }
  });
});
new tt();
const Hs = /* @__PURE__ */ Be.forwardRef(({
  sdfGlyphSize: o = 64,
  anchorX: r = "center",
  anchorY: u = "middle",
  font: c,
  fontSize: t = 1,
  children: e,
  characters: n,
  onSync: s,
  ...a
}, i) => {
  const l = Pr(({
    invalidate: g
  }) => g), [h] = Be.useState(() => new lo()), [d, p] = Be.useMemo(() => {
    const g = [];
    let S = "";
    return Be.Children.forEach(e, (w) => {
      typeof w == "string" || typeof w == "number" ? S += w : g.push(w);
    }), [g, S];
  }, [e]);
  return Mi(() => new Promise((g) => Ts({
    font: c,
    characters: n
  }, g)), ["troika-text", c, n]), Be.useLayoutEffect(() => {
    h.sync(() => {
      l(), s && s(h);
    });
  }), Be.useEffect(() => () => h.dispose(), [h]), /* @__PURE__ */ Be.createElement("primitive", Tn({
    object: h,
    ref: i,
    font: c,
    text: p,
    anchorX: r,
    anchorY: u,
    fontSize: t,
    sdfGlyphSize: o
  }, a), d);
}), Vs = 3e3, js = 3001, uo = (o, r, u) => {
  let c;
  switch (o) {
    case pn:
      c = new Uint8ClampedArray(r * u * 4);
      break;
    case Fr:
      c = new Uint16Array(r * u * 4);
      break;
    case Xo:
      c = new Uint32Array(r * u * 4);
      break;
    case jo:
      c = new Int8Array(r * u * 4);
      break;
    case Vo:
      c = new Int16Array(r * u * 4);
      break;
    case Ho:
      c = new Int32Array(r * u * 4);
      break;
    case zr:
      c = new Float32Array(r * u * 4);
      break;
    default:
      throw new Error("Unsupported data type");
  }
  return c;
};
let Ot;
const Xs = (o, r, u, c) => {
  if (Ot !== void 0)
    return Ot;
  const t = new Da(1, 1, c);
  r.setRenderTarget(t);
  const e = new Xr(new St(), new ka({ color: 16777215 }));
  r.render(e, u), r.setRenderTarget(null);
  const n = uo(o, t.width, t.height);
  return r.readRenderTargetPixels(t, 0, 0, t.width, t.height, n), t.dispose(), e.geometry.dispose(), e.material.dispose(), Ot = n[0] !== 0, Ot;
};
class Dn {
  _renderer;
  _rendererIsDisposable = !1;
  _material;
  _scene;
  _camera;
  _quad;
  _renderTarget;
  _width;
  _height;
  _type;
  _colorSpace;
  _supportsReadPixels = !0;
  /**
   * Constructs a new QuadRenderer
   *
   * @param options Parameters for this QuadRenderer
   */
  constructor(r) {
    this._width = r.width, this._height = r.height, this._type = r.type, this._colorSpace = r.colorSpace;
    const u = {
      // fixed options
      format: yt,
      depthBuffer: !1,
      stencilBuffer: !1,
      // user options
      type: this._type,
      // set in class property
      colorSpace: this._colorSpace,
      // set in class property
      anisotropy: r.renderTargetOptions?.anisotropy !== void 0 ? r.renderTargetOptions?.anisotropy : 1,
      generateMipmaps: r.renderTargetOptions?.generateMipmaps !== void 0 ? r.renderTargetOptions?.generateMipmaps : !1,
      magFilter: r.renderTargetOptions?.magFilter !== void 0 ? r.renderTargetOptions?.magFilter : Ur,
      minFilter: r.renderTargetOptions?.minFilter !== void 0 ? r.renderTargetOptions?.minFilter : Ur,
      samples: r.renderTargetOptions?.samples !== void 0 ? r.renderTargetOptions?.samples : void 0,
      wrapS: r.renderTargetOptions?.wrapS !== void 0 ? r.renderTargetOptions?.wrapS : Nr,
      wrapT: r.renderTargetOptions?.wrapT !== void 0 ? r.renderTargetOptions?.wrapT : Nr
    };
    if (this._material = r.material, r.renderer ? this._renderer = r.renderer : (this._renderer = Dn.instantiateRenderer(), this._rendererIsDisposable = !0), this._scene = new Ra(), this._camera = new zo(), this._camera.position.set(0, 0, 10), this._camera.left = -0.5, this._camera.right = 0.5, this._camera.top = 0.5, this._camera.bottom = -0.5, this._camera.updateProjectionMatrix(), !Xs(this._type, this._renderer, this._camera, u)) {
      let c;
      this._type === Fr && (c = this._renderer.extensions.has("EXT_color_buffer_float") ? zr : void 0), c !== void 0 ? (console.warn(`This browser does not support reading pixels from ${this._type} RenderTargets, switching to ${zr}`), this._type = c) : (this._supportsReadPixels = !1, console.warn("This browser dos not support toArray or toDataTexture, calls to those methods will result in an error thrown"));
    }
    this._quad = new Xr(new St(), this._material), this._quad.geometry.computeBoundingBox(), this._scene.add(this._quad), this._renderTarget = new Da(this.width, this.height, u), this._renderTarget.texture.mapping = r.renderTargetOptions?.mapping !== void 0 ? r.renderTargetOptions?.mapping : _t;
  }
  /**
   * Instantiates a temporary renderer
   *
   * @returns
   */
  static instantiateRenderer() {
    const r = new Co();
    return r.setSize(128, 128), r;
  }
  /**
   * Renders the input texture using the specified material
   */
  render = () => {
    this._renderer.setRenderTarget(this._renderTarget);
    try {
      this._renderer.render(this._scene, this._camera);
    } catch (r) {
      throw this._renderer.setRenderTarget(null), r;
    }
    this._renderer.setRenderTarget(null);
  };
  /**
   * Obtains a Buffer containing the rendered texture.
   *
   * @throws Error if the browser cannot read pixels from this RenderTarget type.
   * @returns a TypedArray containing RGBA values from this renderer
   */
  toArray() {
    if (!this._supportsReadPixels)
      throw new Error("Can't read pixels in this browser");
    const r = uo(this._type, this._width, this._height);
    return this._renderer.readRenderTargetPixels(this._renderTarget, 0, 0, this._width, this._height, r), r;
  }
  /**
   * Performs a readPixel operation in the renderTarget
   * and returns a DataTexture containing the read data
   *
   * @param options options
   * @returns
   */
  toDataTexture(r) {
    const u = new Wo(
      // fixed values
      this.toArray(),
      this.width,
      this.height,
      yt,
      this._type,
      // user values
      r?.mapping || _t,
      r?.wrapS || Nr,
      r?.wrapT || Nr,
      r?.magFilter || Ur,
      r?.minFilter || Ur,
      r?.anisotropy || 1,
      // fixed value
      vn
    );
    return u.generateMipmaps = r?.generateMipmaps !== void 0 ? r?.generateMipmaps : !1, u;
  }
  /**
   * If using a disposable renderer, it will dispose it.
   */
  disposeOnDemandRenderer() {
    this._renderer.setRenderTarget(null), this._rendererIsDisposable && (this._renderer.dispose(), this._renderer.forceContextLoss());
  }
  /**
   * Will dispose of **all** assets used by this renderer.
   *
   *
   * @param disposeRenderTarget will dispose of the renderTarget which will not be usable later
   * set this to true if you passed the `renderTarget.texture` to a `PMREMGenerator`
   * or are otherwise done with it.
   *
   * @example
   * ```js
   * const loader = new HDRJPGLoader(renderer)
   * const result = await loader.loadAsync('gainmap.jpeg')
   * const mesh = new Mesh(geometry, new MeshBasicMaterial({ map: result.renderTarget.texture }) )
   * // DO NOT dispose the renderTarget here,
   * // it is used directly in the material
   * result.dispose()
   * ```
   *
   * @example
   * ```js
   * const loader = new HDRJPGLoader(renderer)
   * const pmremGenerator = new PMREMGenerator( renderer );
   * const result = await loader.loadAsync('gainmap.jpeg')
   * const envMap = pmremGenerator.fromEquirectangular(result.renderTarget.texture)
   * const mesh = new Mesh(geometry, new MeshStandardMaterial({ envMap }) )
   * // renderTarget can be disposed here
   * // because it was used to generate a PMREM texture
   * result.dispose(true)
   * ```
   */
  dispose(r) {
    this.disposeOnDemandRenderer(), r && this.renderTarget.dispose(), this.material instanceof Ht && Object.values(this.material.uniforms).forEach((u) => {
      u.value instanceof Yr && u.value.dispose();
    }), Object.values(this.material).forEach((u) => {
      u instanceof Yr && u.dispose();
    }), this.material.dispose(), this._quad.geometry.dispose();
  }
  /**
   * Width of the texture
   */
  get width() {
    return this._width;
  }
  set width(r) {
    this._width = r, this._renderTarget.setSize(this._width, this._height);
  }
  /**
   * Height of the texture
   */
  get height() {
    return this._height;
  }
  set height(r) {
    this._height = r, this._renderTarget.setSize(this._width, this._height);
  }
  /**
   * The renderer used
   */
  get renderer() {
    return this._renderer;
  }
  /**
   * The `WebGLRenderTarget` used.
   */
  get renderTarget() {
    return this._renderTarget;
  }
  set renderTarget(r) {
    this._renderTarget = r, this._width = r.width, this._height = r.height;
  }
  /**
   * The `Material` used.
   */
  get material() {
    return this._material;
  }
  /**
   *
   */
  get type() {
    return this._type;
  }
  get colorSpace() {
    return this._colorSpace;
  }
}
class co extends Error {
}
class fo extends Error {
}
const dt = (o, r, u) => {
  const c = new RegExp(`${r}="([^"]*)"`, "i").exec(o);
  if (c)
    return c[1];
  const t = new RegExp(`<${r}[^>]*>([\\s\\S]*?)</${r}>`, "i").exec(o);
  if (t) {
    const e = t[1].match(/<rdf:li>([^<]*)<\/rdf:li>/g);
    return e && e.length === 3 ? e.map((n) => n.replace(/<\/?rdf:li>/g, "")) : t[1].trim();
  }
  if (u !== void 0)
    return u;
  throw new Error(`Can't find ${r} in gainmap metadata`);
}, Zs = (o) => {
  let r;
  typeof TextDecoder < "u" ? r = new TextDecoder().decode(o) : r = o.toString();
  let u = r.indexOf("<x:xmpmeta");
  for (; u !== -1; ) {
    const c = r.indexOf("x:xmpmeta>", u), t = r.slice(u, c + 10);
    try {
      const e = dt(t, "hdrgm:GainMapMin", "0"), n = dt(t, "hdrgm:GainMapMax"), s = dt(t, "hdrgm:Gamma", "1"), a = dt(t, "hdrgm:OffsetSDR", "0.015625"), i = dt(t, "hdrgm:OffsetHDR", "0.015625"), l = /hdrgm:HDRCapacityMin="([^"]*)"/.exec(t), h = l ? l[1] : "0", d = /hdrgm:HDRCapacityMax="([^"]*)"/.exec(t);
      if (!d)
        throw new Error("Incomplete gainmap metadata");
      const p = d[1];
      return {
        gainMapMin: Array.isArray(e) ? e.map((g) => parseFloat(g)) : [parseFloat(e), parseFloat(e), parseFloat(e)],
        gainMapMax: Array.isArray(n) ? n.map((g) => parseFloat(g)) : [parseFloat(n), parseFloat(n), parseFloat(n)],
        gamma: Array.isArray(s) ? s.map((g) => parseFloat(g)) : [parseFloat(s), parseFloat(s), parseFloat(s)],
        offsetSdr: Array.isArray(a) ? a.map((g) => parseFloat(g)) : [parseFloat(a), parseFloat(a), parseFloat(a)],
        offsetHdr: Array.isArray(i) ? i.map((g) => parseFloat(g)) : [parseFloat(i), parseFloat(i), parseFloat(i)],
        hdrCapacityMin: parseFloat(h),
        hdrCapacityMax: parseFloat(p)
      };
    } catch {
    }
    u = r.indexOf("<x:xmpmeta", c);
  }
};
class Ys {
  options;
  constructor(r) {
    this.options = {
      debug: r && r.debug !== void 0 ? r.debug : !1,
      extractFII: r && r.extractFII !== void 0 ? r.extractFII : !0,
      extractNonFII: r && r.extractNonFII !== void 0 ? r.extractNonFII : !0
    };
  }
  extract(r) {
    return new Promise((u, c) => {
      const t = this.options.debug, e = new DataView(r.buffer);
      if (e.getUint16(0) !== 65496) {
        c(new Error("Not a valid jpeg"));
        return;
      }
      const n = e.byteLength;
      let s = 2, a = 0, i;
      for (; s < n; ) {
        if (++a > 250) {
          c(new Error(`Found no marker after ${a} loops 😵`));
          return;
        }
        if (e.getUint8(s) !== 255) {
          c(new Error(`Not a valid marker at offset 0x${s.toString(16)}, found: 0x${e.getUint8(s).toString(16)}`));
          return;
        }
        if (i = e.getUint8(s + 1), t && console.log(`Marker: ${i.toString(16)}`), i === 226) {
          t && console.log("Found APP2 marker (0xffe2)");
          const l = s + 4;
          if (e.getUint32(l) === 1297106432) {
            const h = l + 4;
            let d;
            if (e.getUint16(h) === 18761)
              d = !1;
            else if (e.getUint16(h) === 19789)
              d = !0;
            else {
              c(new Error("No valid endianness marker found in TIFF header"));
              return;
            }
            if (e.getUint16(h + 2, !d) !== 42) {
              c(new Error("Not valid TIFF data! (no 0x002A marker)"));
              return;
            }
            const p = e.getUint32(h + 4, !d);
            if (p < 8) {
              c(new Error("Not valid TIFF data! (First offset less than 8)"));
              return;
            }
            const g = h + p, S = e.getUint16(g, !d), w = g + 2;
            let I = 0;
            for (let U = w; U < w + 12 * S; U += 12)
              e.getUint16(U, !d) === 45057 && (I = e.getUint32(U + 8, !d));
            const k = g + 2 + S * 12 + 4, T = [];
            for (let U = k; U < k + I * 16; U += 16) {
              const O = {
                MPType: e.getUint32(U, !d),
                size: e.getUint32(U + 4, !d),
                // This offset is specified relative to the address of the MP Endian
                // field in the MP Header, unless the image is a First Individual Image,
                // in which case the value of the offset shall be NULL (0x00000000).
                dataOffset: e.getUint32(U + 8, !d),
                dependantImages: e.getUint32(U + 12, !d),
                start: -1,
                end: -1,
                isFII: !1
              };
              O.dataOffset ? (O.start = h + O.dataOffset, O.isFII = !1) : (O.start = 0, O.isFII = !0), O.end = O.start + O.size, T.push(O);
            }
            if (this.options.extractNonFII && T.length) {
              const U = new Blob([e]), O = [];
              for (const C of T) {
                if (C.isFII && !this.options.extractFII)
                  continue;
                const y = U.slice(C.start, C.end + 1, "image/jpeg");
                O.push(y);
              }
              u(O);
            }
          }
        }
        s += 2 + e.getUint16(s + 2);
      }
    });
  }
}
const Ks = async (o) => {
  const r = Zs(o);
  if (!r)
    throw new fo("Gain map XMP metadata not found");
  const c = await new Ys({ extractFII: !0, extractNonFII: !0 }).extract(o);
  if (c.length !== 2)
    throw new co("Gain map recovery image not found");
  return {
    sdr: new Uint8Array(await c[0].arrayBuffer()),
    gainMap: new Uint8Array(await c[1].arrayBuffer()),
    metadata: r
  };
}, xa = (o) => new Promise((r, u) => {
  const c = document.createElement("img");
  c.onload = () => {
    r(c);
  }, c.onerror = (t) => {
    u(t);
  }, c.src = URL.createObjectURL(o);
});
class qs extends Zo {
  _renderer;
  _renderTargetOptions;
  _internalLoadingManager;
  _config;
  constructor(r, u) {
    super(u), this._config = r, r.renderer && (this._renderer = r.renderer), this._internalLoadingManager = new Yo();
  }
  setRenderer(r) {
    return this._renderer = r, this;
  }
  setRenderTargetOptions(r) {
    return this._renderTargetOptions = r, this;
  }
  prepareQuadRenderer() {
    this._renderer || console.warn("WARNING: A Renderer was not passed to this Loader constructor or in setRenderer, the result of this Loader will need to be converted to a Data Texture with toDataTexture() before you can use it in your renderer.");
    const r = this._config.createMaterial({
      gainMapMax: [1, 1, 1],
      gainMapMin: [0, 0, 0],
      gamma: [1, 1, 1],
      offsetHdr: [1, 1, 1],
      offsetSdr: [1, 1, 1],
      hdrCapacityMax: 1,
      hdrCapacityMin: 0,
      maxDisplayBoost: 1,
      gainMap: new Yr(),
      sdr: new Yr()
    });
    return this._config.createQuadRenderer({
      width: 16,
      height: 16,
      type: Fr,
      colorSpace: vn,
      material: r,
      renderer: this._renderer,
      renderTargetOptions: this._renderTargetOptions
    });
  }
  async processImages(r, u, c) {
    const t = u ? new Blob([u], { type: "image/jpeg" }) : void 0, e = new Blob([r], { type: "image/jpeg" });
    let n, s, a = !1;
    if (typeof createImageBitmap > "u") {
      const i = await Promise.all([
        t ? xa(t) : Promise.resolve(void 0),
        xa(e)
      ]);
      s = i[0], n = i[1], a = c === "flipY";
    } else {
      const i = await Promise.all([
        t ? createImageBitmap(t, { imageOrientation: c || "flipY" }) : Promise.resolve(void 0),
        createImageBitmap(e, { imageOrientation: c || "flipY" })
      ]);
      s = i[0], n = i[1];
    }
    return { sdrImage: n, gainMapImage: s, needsFlip: a };
  }
  createTextures(r, u, c) {
    const t = new Yr(u || new ImageData(2, 2), _t, Nr, Nr, Ur, aa, yt, pn, 1, vn);
    t.flipY = c, t.needsUpdate = !0;
    const e = new Yr(r, _t, Nr, Nr, Ur, aa, yt, pn, 1, Ia);
    return e.flipY = c, e.needsUpdate = !0, { gainMap: t, sdr: e };
  }
  updateQuadRenderer(r, u, c, t, e) {
    r.width = u.width, r.height = u.height, r.material.gainMap = c, r.material.sdr = t, r.material.gainMapMin = e.gainMapMin, r.material.gainMapMax = e.gainMapMax, r.material.offsetHdr = e.offsetHdr, r.material.offsetSdr = e.offsetSdr, r.material.gamma = e.gamma, r.material.hdrCapacityMin = e.hdrCapacityMin, r.material.hdrCapacityMax = e.hdrCapacityMax, r.material.maxDisplayBoost = Math.pow(2, e.hdrCapacityMax), r.material.needsUpdate = !0;
  }
}
const Js = (
  /* glsl */
  `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`
), Qs = (
  /* glsl */
  `
// min half float value
#define HALF_FLOAT_MIN vec3( -65504, -65504, -65504 )
// max half float value
#define HALF_FLOAT_MAX vec3( 65504, 65504, 65504 )

uniform sampler2D sdr;
uniform sampler2D gainMap;
uniform vec3 gamma;
uniform vec3 offsetHdr;
uniform vec3 offsetSdr;
uniform vec3 gainMapMin;
uniform vec3 gainMapMax;
uniform float weightFactor;

varying vec2 vUv;

void main() {
  vec3 rgb = texture2D( sdr, vUv ).rgb;
  vec3 recovery = texture2D( gainMap, vUv ).rgb;
  vec3 logRecovery = pow( recovery, gamma );
  vec3 logBoost = gainMapMin * ( 1.0 - logRecovery ) + gainMapMax * logRecovery;
  vec3 hdrColor = (rgb + offsetSdr) * exp2( logBoost * weightFactor ) - offsetHdr;
  vec3 clampedHdrColor = max( HALF_FLOAT_MIN, min( HALF_FLOAT_MAX, hdrColor ));
  gl_FragColor = vec4( clampedHdrColor , 1.0 );
}
`
);
class $s extends Ht {
  _maxDisplayBoost;
  _hdrCapacityMin;
  _hdrCapacityMax;
  /**
   *
   * @param params
   */
  constructor({ gamma: r, offsetHdr: u, offsetSdr: c, gainMapMin: t, gainMapMax: e, maxDisplayBoost: n, hdrCapacityMin: s, hdrCapacityMax: a, sdr: i, gainMap: l }) {
    super({
      name: "GainMapDecoderMaterial",
      vertexShader: Js,
      fragmentShader: Qs,
      uniforms: {
        sdr: { value: i },
        gainMap: { value: l },
        gamma: { value: new nr(1 / r[0], 1 / r[1], 1 / r[2]) },
        offsetHdr: { value: new nr().fromArray(u) },
        offsetSdr: { value: new nr().fromArray(c) },
        gainMapMin: { value: new nr().fromArray(t) },
        gainMapMax: { value: new nr().fromArray(e) },
        weightFactor: {
          value: (Math.log2(n) - s) / (a - s)
        }
      },
      blending: Ko,
      depthTest: !1,
      depthWrite: !1
    }), this._maxDisplayBoost = n, this._hdrCapacityMin = s, this._hdrCapacityMax = a, this.needsUpdate = !0, this.uniformsNeedUpdate = !0;
  }
  get sdr() {
    return this.uniforms.sdr.value;
  }
  set sdr(r) {
    this.uniforms.sdr.value = r;
  }
  get gainMap() {
    return this.uniforms.gainMap.value;
  }
  set gainMap(r) {
    this.uniforms.gainMap.value = r;
  }
  /**
   * @see {@link GainMapMetadata.offsetHdr}
   */
  get offsetHdr() {
    return this.uniforms.offsetHdr.value.toArray();
  }
  set offsetHdr(r) {
    this.uniforms.offsetHdr.value.fromArray(r);
  }
  /**
   * @see {@link GainMapMetadata.offsetSdr}
   */
  get offsetSdr() {
    return this.uniforms.offsetSdr.value.toArray();
  }
  set offsetSdr(r) {
    this.uniforms.offsetSdr.value.fromArray(r);
  }
  /**
   * @see {@link GainMapMetadata.gainMapMin}
   */
  get gainMapMin() {
    return this.uniforms.gainMapMin.value.toArray();
  }
  set gainMapMin(r) {
    this.uniforms.gainMapMin.value.fromArray(r);
  }
  /**
   * @see {@link GainMapMetadata.gainMapMax}
   */
  get gainMapMax() {
    return this.uniforms.gainMapMax.value.toArray();
  }
  set gainMapMax(r) {
    this.uniforms.gainMapMax.value.fromArray(r);
  }
  /**
   * @see {@link GainMapMetadata.gamma}
   */
  get gamma() {
    const r = this.uniforms.gamma.value;
    return [1 / r.x, 1 / r.y, 1 / r.z];
  }
  set gamma(r) {
    const u = this.uniforms.gamma.value;
    u.x = 1 / r[0], u.y = 1 / r[1], u.z = 1 / r[2];
  }
  /**
   * @see {@link GainMapMetadata.hdrCapacityMin}
   * @remarks Logarithmic space
   */
  get hdrCapacityMin() {
    return this._hdrCapacityMin;
  }
  set hdrCapacityMin(r) {
    this._hdrCapacityMin = r, this.calculateWeight();
  }
  /**
   * @see {@link GainMapMetadata.hdrCapacityMin}
   * @remarks Logarithmic space
   */
  get hdrCapacityMax() {
    return this._hdrCapacityMax;
  }
  set hdrCapacityMax(r) {
    this._hdrCapacityMax = r, this.calculateWeight();
  }
  /**
   * @see {@link GainmapDecodingParameters.maxDisplayBoost}
   * @remarks Non Logarithmic space
   */
  get maxDisplayBoost() {
    return this._maxDisplayBoost;
  }
  set maxDisplayBoost(r) {
    this._maxDisplayBoost = Math.max(1, Math.min(65504, r)), this.calculateWeight();
  }
  calculateWeight() {
    const r = (Math.log2(this._maxDisplayBoost) - this._hdrCapacityMin) / (this._hdrCapacityMax - this._hdrCapacityMin);
    this.uniforms.weightFactor.value = Math.max(0, Math.min(1, r));
  }
}
class ho extends qs {
  constructor(r, u) {
    super({
      renderer: r,
      createMaterial: (c) => new $s(c),
      createQuadRenderer: (c) => new Dn(c)
    }, u);
  }
  /**
   * @private
   * @param quadRenderer
   * @param metadata
   * @param sdrBuffer
   * @param gainMapBuffer
   */
  async render(r, u, c, t) {
    const { sdrImage: e, gainMapImage: n, needsFlip: s } = await this.processImages(c, t, "flipY"), { gainMap: a, sdr: i } = this.createTextures(e, n, s);
    this.updateQuadRenderer(r, e, a, i, u), r.render();
  }
}
class el extends ho {
  /**
   * Loads a gainmap using separate data
   * * sdr image
   * * gain map image
   * * metadata json
   *
   * useful for webp gain maps
   *
   * @param urls An array in the form of [sdr.jpg, gainmap.jpg, metadata.json]
   * @param onLoad Load complete callback, will receive the result
   * @param onProgress Progress callback, will receive a `ProgressEvent`
   * @param onError Error callback
   * @returns
   */
  load([r, u, c], t, e, n) {
    const s = this.prepareQuadRenderer();
    let a, i, l;
    const h = async () => {
      if (a && i && l) {
        try {
          await this.render(s, l, a, i);
        } catch (M) {
          this.manager.itemError(r), this.manager.itemError(u), this.manager.itemError(c), typeof n == "function" && n(M), s.disposeOnDemandRenderer();
          return;
        }
        typeof t == "function" && t(s), this.manager.itemEnd(r), this.manager.itemEnd(u), this.manager.itemEnd(c), s.disposeOnDemandRenderer();
      }
    };
    let d = !0, p = 0, g = 0, S = !0, w = 0, I = 0, A = !0, k = 0, T = 0;
    const U = () => {
      if (typeof e == "function") {
        const M = p + w + k, L = g + I + T, ee = d && S && A;
        e(new ProgressEvent("progress", { lengthComputable: ee, loaded: L, total: M }));
      }
    };
    this.manager.itemStart(r), this.manager.itemStart(u), this.manager.itemStart(c);
    const O = new Lt(this._internalLoadingManager);
    O.setResponseType("arraybuffer"), O.setRequestHeader(this.requestHeader), O.setPath(this.path), O.setWithCredentials(this.withCredentials), O.load(r, async (M) => {
      if (typeof M == "string")
        throw new Error("Invalid sdr buffer");
      a = M, await h();
    }, (M) => {
      d = M.lengthComputable, g = M.loaded, p = M.total, U();
    }, (M) => {
      this.manager.itemError(r), typeof n == "function" && n(M);
    });
    const C = new Lt(this._internalLoadingManager);
    C.setResponseType("arraybuffer"), C.setRequestHeader(this.requestHeader), C.setPath(this.path), C.setWithCredentials(this.withCredentials), C.load(u, async (M) => {
      if (typeof M == "string")
        throw new Error("Invalid gainmap buffer");
      i = M, await h();
    }, (M) => {
      S = M.lengthComputable, I = M.loaded, w = M.total, U();
    }, (M) => {
      this.manager.itemError(u), typeof n == "function" && n(M);
    });
    const y = new Lt(this._internalLoadingManager);
    return y.setRequestHeader(this.requestHeader), y.setPath(this.path), y.setWithCredentials(this.withCredentials), y.load(c, async (M) => {
      if (typeof M != "string")
        throw new Error("Invalid metadata string");
      l = JSON.parse(M), await h();
    }, (M) => {
      A = M.lengthComputable, T = M.loaded, k = M.total, U();
    }, (M) => {
      this.manager.itemError(c), typeof n == "function" && n(M);
    }), s;
  }
}
class rl extends ho {
  /**
   * Loads a JPEG containing gain map metadata
   * Renders a normal SDR image if gainmap data is not found
   *
   * @param url Path to a JPEG file containing embedded gain map metadata
   * @param onLoad Load complete callback, will receive the result
   * @param onProgress Progress callback, will receive a `ProgressEvent`
   * @param onError Error callback
   * @returns
   */
  load(r, u, c, t) {
    const e = this.prepareQuadRenderer(), n = new Lt(this._internalLoadingManager);
    return n.setResponseType("arraybuffer"), n.setRequestHeader(this.requestHeader), n.setPath(this.path), n.setWithCredentials(this.withCredentials), this.manager.itemStart(r), n.load(r, async (s) => {
      if (typeof s == "string")
        throw new Error("Invalid buffer, received [string], was expecting [ArrayBuffer]");
      const a = new Uint8Array(s);
      let i, l, h;
      try {
        const d = await Ks(a);
        i = d.sdr, l = d.gainMap, h = d.metadata;
      } catch (d) {
        if (d instanceof fo || d instanceof co)
          console.warn(`Failure to reconstruct an HDR image from ${r}: Gain map metadata not found in the file, HDRJPGLoader will render the SDR jpeg`), h = {
            gainMapMin: [0, 0, 0],
            gainMapMax: [1, 1, 1],
            gamma: [1, 1, 1],
            hdrCapacityMin: 0,
            hdrCapacityMax: 1,
            offsetHdr: [0, 0, 0],
            offsetSdr: [0, 0, 0]
          }, i = a;
        else
          throw d;
      }
      try {
        await this.render(e, h, i.buffer, l?.buffer);
      } catch (d) {
        this.manager.itemError(r), typeof t == "function" && t(d), e.disposeOnDemandRenderer();
        return;
      }
      typeof u == "function" && u(e), this.manager.itemEnd(r), e.disposeOnDemandRenderer();
    }, c, (s) => {
      this.manager.itemError(r), typeof t == "function" && t(s);
    }), e;
  }
}
const xt = {
  apartment: "lebombo_1k.hdr",
  city: "potsdamer_platz_1k.hdr",
  dawn: "kiara_1_dawn_1k.hdr",
  forest: "forest_slope_1k.hdr",
  lobby: "st_fagans_interior_1k.hdr",
  night: "dikhololo_night_1k.hdr",
  park: "rooitou_park_1k.hdr",
  studio: "studio_small_03_1k.hdr",
  sunset: "venice_sunset_1k.hdr",
  warehouse: "empty_warehouse_01_1k.hdr"
}, vo = "https://raw.githack.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d99b8bcce736/hdri/", rt = (o) => Array.isArray(o), In = ["/px.png", "/nx.png", "/py.png", "/ny.png", "/pz.png", "/nz.png"];
function Kt({
  files: o = In,
  path: r = "",
  preset: u = void 0,
  encoding: c = void 0,
  extensions: t
} = {}) {
  let e = null, n = !1;
  u && (On(u), o = xt[u], r = vo), n = rt(o);
  const {
    extension: s,
    isCubemap: a
  } = Ln(o);
  if (e = Pn(s), !e) throw new Error("useEnvironment: Unrecognized file extension: " + o);
  const i = Pr((p) => p.gl);
  Be.useLayoutEffect(() => {
    if (s !== "webp" && s !== "jpg" && s !== "jpeg") return;
    function p() {
      wt.clear(
        // @ts-expect-error
        e,
        n ? [o] : o
      );
    }
    i.domElement.addEventListener("webglcontextlost", p, {
      once: !0
    });
  }, [o, i.domElement]);
  const l = wt(
    // @ts-expect-error
    e,
    n ? [o] : o,
    (p) => {
      (s === "webp" || s === "jpg" || s === "jpeg") && p.setRenderer(i), p.setPath == null || p.setPath(r), t && t(p);
    }
  );
  let h = n ? (
    // @ts-ignore
    l[0]
  ) : l;
  if (s === "jpg" || s === "jpeg" || s === "webp") {
    var d;
    h = (d = h.renderTarget) == null ? void 0 : d.texture;
  }
  return h.mapping = a ? qo : Un, "colorSpace" in h ? h.colorSpace = c ?? a ? "srgb" : "srgb-linear" : h.encoding = c ?? a ? js : Vs, h;
}
const tl = {
  files: In,
  path: "",
  preset: void 0,
  extensions: void 0
};
Kt.preload = (o) => {
  const r = {
    ...tl,
    ...o
  };
  let {
    files: u,
    path: c = ""
  } = r;
  const {
    preset: t,
    extensions: e
  } = r;
  t && (On(t), u = xt[t], c = vo);
  const {
    extension: n
  } = Ln(u);
  if (n === "webp" || n === "jpg" || n === "jpeg")
    throw new Error("useEnvironment: Preloading gainmaps is not supported");
  const s = Pn(n);
  if (!s) throw new Error("useEnvironment: Unrecognized file extension: " + u);
  wt.preload(
    // @ts-expect-error
    s,
    rt(u) ? [u] : u,
    (a) => {
      a.setPath == null || a.setPath(c), e && e(a);
    }
  );
};
const nl = {
  files: In,
  preset: void 0
};
Kt.clear = (o) => {
  const r = {
    ...nl,
    ...o
  };
  let {
    files: u
  } = r;
  const {
    preset: c
  } = r;
  c && (On(c), u = xt[c]);
  const {
    extension: t
  } = Ln(u), e = Pn(t);
  if (!e) throw new Error("useEnvironment: Unrecognized file extension: " + u);
  wt.clear(
    // @ts-expect-error
    e,
    rt(u) ? [u] : u
  );
};
function On(o) {
  if (!(o in xt)) throw new Error("Preset must be one of: " + Object.keys(xt).join(", "));
}
function Ln(o) {
  var r;
  const u = rt(o) && o.length === 6, c = rt(o) && o.length === 3 && o.some((n) => n.endsWith("json")), t = rt(o) ? o[0] : o;
  return {
    extension: u ? "cube" : c ? "webp" : t.startsWith("data:application/exr") ? "exr" : t.startsWith("data:application/hdr") ? "hdr" : t.startsWith("data:image/jpeg") ? "jpg" : (r = t.split(".").pop()) == null || (r = r.split("?")) == null || (r = r.shift()) == null ? void 0 : r.toLowerCase(),
    isCubemap: u,
    isGainmap: c
  };
}
function Pn(o) {
  return o === "cube" ? Jo : o === "hdr" ? Xi : o === "exr" ? Zi : o === "jpg" || o === "jpeg" ? rl : o === "webp" ? el : null;
}
const al = (o) => o.current && o.current.isScene, ol = (o) => al(o) ? o.current : o;
function Bn(o, r, u, c, t = {}) {
  var e, n, s, a;
  t = {
    backgroundBlurriness: 0,
    backgroundIntensity: 1,
    backgroundRotation: [0, 0, 0],
    environmentIntensity: 1,
    environmentRotation: [0, 0, 0],
    ...t
  };
  const i = ol(r || u), l = i.background, h = i.environment, d = {
    // @ts-ignore
    backgroundBlurriness: i.backgroundBlurriness,
    // @ts-ignore
    backgroundIntensity: i.backgroundIntensity,
    // @ts-ignore
    backgroundRotation: (e = (n = i.backgroundRotation) == null || n.clone == null ? void 0 : n.clone()) !== null && e !== void 0 ? e : [0, 0, 0],
    // @ts-ignore
    environmentIntensity: i.environmentIntensity,
    // @ts-ignore
    environmentRotation: (s = (a = i.environmentRotation) == null || a.clone == null ? void 0 : a.clone()) !== null && s !== void 0 ? s : [0, 0, 0]
  };
  return o !== "only" && (i.environment = c), o && (i.background = c), oa(i, t), () => {
    o !== "only" && (i.environment = h), o && (i.background = l), oa(i, d);
  };
}
function Gn({
  scene: o,
  background: r = !1,
  map: u,
  ...c
}) {
  const t = Pr((e) => e.scene);
  return Be.useLayoutEffect(() => {
    if (u) return Bn(r, o, t, u, c);
  }), null;
}
function po({
  background: o = !1,
  scene: r,
  blur: u,
  backgroundBlurriness: c,
  backgroundIntensity: t,
  backgroundRotation: e,
  environmentIntensity: n,
  environmentRotation: s,
  ...a
}) {
  const i = Kt(a), l = Pr((h) => h.scene);
  return Be.useLayoutEffect(() => Bn(o, r, l, i, {
    backgroundBlurriness: u ?? c,
    backgroundIntensity: t,
    backgroundRotation: e,
    environmentIntensity: n,
    environmentRotation: s
  })), Be.useEffect(() => () => {
    i.dispose();
  }, [i]), null;
}
function il({
  children: o,
  near: r = 0.1,
  far: u = 1e3,
  resolution: c = 256,
  frames: t = 1,
  map: e,
  background: n = !1,
  blur: s,
  backgroundBlurriness: a,
  backgroundIntensity: i,
  backgroundRotation: l,
  environmentIntensity: h,
  environmentRotation: d,
  scene: p,
  files: g,
  path: S,
  preset: w = void 0,
  extensions: I
}) {
  const A = Pr((y) => y.gl), k = Pr((y) => y.scene), T = Be.useRef(null), [U] = Be.useState(() => new Ra()), O = Be.useMemo(() => {
    const y = new Ao(c);
    return y.texture.type = Fr, y;
  }, [c]);
  Be.useEffect(() => () => {
    O.dispose();
  }, [O]), Be.useLayoutEffect(() => {
    if (t === 1) {
      const y = A.autoClear;
      A.autoClear = !0, T.current.update(A, U), A.autoClear = y;
    }
    return Bn(n, p, k, O.texture, {
      backgroundBlurriness: s ?? a,
      backgroundIntensity: i,
      backgroundRotation: l,
      environmentIntensity: h,
      environmentRotation: d
    });
  }, [o, U, O.texture, p, k, n, t, A]);
  let C = 1;
  return Xt(() => {
    if (t === 1 / 0 || C < t) {
      const y = A.autoClear;
      A.autoClear = !0, T.current.update(A, U), A.autoClear = y, C++;
    }
  }), /* @__PURE__ */ Be.createElement(Be.Fragment, null, Ui(/* @__PURE__ */ Be.createElement(Be.Fragment, null, o, /* @__PURE__ */ Be.createElement("cubeCamera", {
    ref: T,
    args: [r, u, O]
  }), g || w ? /* @__PURE__ */ Be.createElement(po, {
    background: !0,
    files: g,
    preset: w,
    path: S,
    extensions: I
  }) : e ? /* @__PURE__ */ Be.createElement(Gn, {
    background: !0,
    map: e,
    extensions: I
  }) : null), U));
}
function sl(o) {
  var r, u, c, t;
  const e = Kt(o), n = o.map || e;
  Be.useMemo(() => Ti({
    GroundProjectedEnvImpl: ji
  }), []), Be.useEffect(() => () => {
    e.dispose();
  }, [e]);
  const s = Be.useMemo(() => [n], [n]), a = (r = o.ground) == null ? void 0 : r.height, i = (u = o.ground) == null ? void 0 : u.radius, l = (c = (t = o.ground) == null ? void 0 : t.scale) !== null && c !== void 0 ? c : 1e3;
  return /* @__PURE__ */ Be.createElement(Be.Fragment, null, /* @__PURE__ */ Be.createElement(Gn, Tn({}, o, {
    map: n
  })), /* @__PURE__ */ Be.createElement("groundProjectedEnvImpl", {
    args: s,
    scale: l,
    height: a,
    radius: i
  }));
}
function go(o) {
  return o.ground ? /* @__PURE__ */ Be.createElement(sl, o) : o.map ? /* @__PURE__ */ Be.createElement(Gn, o) : o.children ? /* @__PURE__ */ Be.createElement(il, o) : /* @__PURE__ */ Be.createElement(po, o);
}
function ll(o, r, u = new nr()) {
  const c = Math.PI * (o - 0.5), t = 2 * Math.PI * (r - 0.5);
  return u.x = Math.cos(t), u.y = Math.sin(c), u.z = Math.sin(t), u;
}
const ul = /* @__PURE__ */ Be.forwardRef(({
  inclination: o = 0.6,
  azimuth: r = 0.1,
  distance: u = 1e3,
  mieCoefficient: c = 5e-3,
  mieDirectionalG: t = 0.8,
  rayleigh: e = 0.5,
  turbidity: n = 10,
  sunPosition: s = ll(o, r),
  ...a
}, i) => {
  const l = Be.useMemo(() => new nr().setScalar(u), [u]), [h] = Be.useState(() => new Hi());
  return /* @__PURE__ */ Be.createElement("primitive", Tn({
    object: h,
    ref: i,
    "material-uniforms-mieCoefficient-value": c,
    "material-uniforms-mieDirectionalG-value": t,
    "material-uniforms-rayleigh-value": e,
    "material-uniforms-sunPosition-value": s,
    "material-uniforms-turbidity-value": n,
    scale: l
  }, a));
});
function Sn(o, r) {
  return r.getBoneName !== void 0 ? r.getBoneName(o) : r.names[o.name];
}
function cl(o, r, u = {}) {
  const c = new bt(), t = new nr(), e = new qr(), n = new qr();
  u.preserveBoneMatrix = u.preserveBoneMatrix !== void 0 ? u.preserveBoneMatrix : !0, u.preserveBonePositions = u.preserveBonePositions !== void 0 ? u.preserveBonePositions : !0, u.useTargetMatrix = u.useTargetMatrix !== void 0 ? u.useTargetMatrix : !1, u.hip = u.hip !== void 0 ? u.hip : "hip", u.hipInfluence = u.hipInfluence !== void 0 ? u.hipInfluence : new nr(1, 1, 1), u.scale = u.scale !== void 0 ? u.scale : 1, u.names = u.names || {};
  const s = r.isObject3D ? r.skeleton.bones : zt(r), a = o.isObject3D ? o.skeleton.bones : zt(o);
  let i, l, h, d;
  if (o.isObject3D ? o.skeleton.pose() : (u.useTargetMatrix = !0, u.preserveBoneMatrix = !1), u.preserveBonePositions) {
    d = [];
    for (let p = 0; p < a.length; p++)
      d.push(a[p].position.clone());
  }
  if (u.preserveBoneMatrix) {
    o.updateMatrixWorld(), o.matrixWorld.identity();
    for (let p = 0; p < o.children.length; ++p)
      o.children[p].updateMatrixWorld(!0);
  }
  for (let p = 0; p < a.length; ++p)
    i = a[p], l = Sn(i, u), h = yo(l, s), n.copy(i.matrixWorld), h && (h.updateMatrixWorld(), u.useTargetMatrix ? e.copy(h.matrixWorld) : (e.copy(o.matrixWorld).invert(), e.multiply(h.matrixWorld)), t.setFromMatrixScale(e), e.scale(t.set(1 / t.x, 1 / t.y, 1 / t.z)), n.makeRotationFromQuaternion(c.setFromRotationMatrix(e)), o.isObject3D && u.localOffsets && u.localOffsets[i.name] && n.multiply(u.localOffsets[i.name]), n.copyPosition(e)), l === u.hip && (n.elements[12] *= u.scale * u.hipInfluence.x, n.elements[13] *= u.scale * u.hipInfluence.y, n.elements[14] *= u.scale * u.hipInfluence.z, u.hipPosition !== void 0 && (n.elements[12] += u.hipPosition.x * u.scale, n.elements[13] += u.hipPosition.y * u.scale, n.elements[14] += u.hipPosition.z * u.scale)), i.parent ? (i.matrix.copy(i.parent.matrixWorld).invert(), i.matrix.multiply(n)) : i.matrix.copy(n), i.matrix.decompose(i.position, i.quaternion, i.scale), i.updateMatrixWorld();
  if (u.preserveBonePositions)
    for (let p = 0; p < a.length; ++p)
      i = a[p], l = Sn(i, u) || i.name, l !== u.hip && i.position.copy(d[p]);
  u.preserveBoneMatrix && o.updateMatrixWorld(!0);
}
function fl(o, r, u, c = {}) {
  c.useFirstFramePosition = c.useFirstFramePosition !== void 0 ? c.useFirstFramePosition : !1, c.fps = c.fps !== void 0 ? c.fps : Math.max(...u.tracks.map((I) => I.times.length)) / u.duration, c.names = c.names || [], r.isObject3D || (r = hl(r));
  const t = Math.round(u.duration * (c.fps / 1e3) * 1e3), e = u.duration / (t - 1), n = [], s = new Oa(r), a = zt(o.skeleton), i = [];
  let l, h, d, p, g;
  s.clipAction(u).play();
  let S = 0, w = t;
  c.trim !== void 0 ? (S = Math.round(c.trim[0] * c.fps), w = Math.min(Math.round(c.trim[1] * c.fps), t) - S, s.update(c.trim[0])) : s.update(0), r.updateMatrixWorld();
  for (let I = 0; I < w; ++I) {
    const A = I * e;
    cl(o, r, c);
    for (let k = 0; k < a.length; ++k)
      h = a[k], g = Sn(h, c) || h.name, d = yo(g, r.skeleton), d && (p = i[k] = i[k] || { bone: h }, c.hip === g && (p.pos || (p.pos = {
        times: new Float32Array(w),
        values: new Float32Array(w * 3)
      }), c.useFirstFramePosition && (I === 0 && (l = h.position.clone()), h.position.sub(l)), p.pos.times[I] = A, h.position.toArray(p.pos.values, I * 3)), p.quat || (p.quat = {
        times: new Float32Array(w),
        values: new Float32Array(w * 4)
      }), p.quat.times[I] = A, h.quaternion.toArray(p.quat.values, I * 4));
    I === w - 2 ? s.update(e - 1e-7) : s.update(e), r.updateMatrixWorld();
  }
  for (let I = 0; I < i.length; ++I)
    p = i[I], p && (p.pos && n.push(new Qo(
      ".bones[" + p.bone.name + "].position",
      p.pos.times,
      p.pos.values
    )), n.push(new $o(
      ".bones[" + p.bone.name + "].quaternion",
      p.quat.times,
      p.quat.values
    )));
  return s.uncacheAction(u), new La(u.name, -1, n);
}
function mo(o) {
  const r = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), c = o.clone();
  return _o(o, c, function(t, e) {
    r.set(e, t), u.set(t, e);
  }), c.traverse(function(t) {
    if (!t.isSkinnedMesh) return;
    const e = t, n = r.get(t), s = n.skeleton.bones;
    e.skeleton = n.skeleton.clone(), e.bindMatrix.copy(n.bindMatrix), e.skeleton.bones = s.map(function(a) {
      return u.get(a);
    }), e.bind(e.skeleton, e.bindMatrix);
  }), c;
}
function yo(o, r) {
  for (let u = 0, c = zt(r); u < c.length; u++)
    if (o === c[u].name)
      return c[u];
}
function zt(o) {
  return Array.isArray(o) ? o : o.bones;
}
function hl(o) {
  const r = new ei(o.bones[0]);
  return r.skeleton = o, r;
}
function _o(o, r, u) {
  u(o, r);
  for (let c = 0; c < o.children.length; c++)
    _o(o.children[c], r.children[c], u);
}
function dl({ part: o }) {
  return o.geometry === "box" ? /* @__PURE__ */ J.jsx("boxGeometry", { args: [o.size[0], o.size[1], o.size[2]] }) : o.geometry === "cylinder" ? /* @__PURE__ */ J.jsx("cylinderGeometry", { args: [o.size[0], o.size[1], o.size[2], 24] }) : o.geometry === "cone" ? /* @__PURE__ */ J.jsx("cylinderGeometry", { args: [0, o.size[0], o.size[1], 24] }) : /* @__PURE__ */ J.jsx("sphereGeometry", { args: [o.size[0], 24, 16] });
}
function vl({ object: o }) {
  const r = o.propKind ? gi[o.propKind] : void 0;
  return r ? /* @__PURE__ */ J.jsx(J.Fragment, { children: r.parts.map((u, c) => /* @__PURE__ */ J.jsxs(
    "mesh",
    {
      position: u.position,
      rotation: u.rotation ? new Et(...u.rotation) : void 0,
      children: [
        /* @__PURE__ */ J.jsx(dl, { part: u }),
        /* @__PURE__ */ J.jsx(
          "meshStandardMaterial",
          {
            color: u.color ?? o.color ?? r.defaultColor,
            roughness: 0.55,
            metalness: 0.04
          }
        )
      ]
    },
    c
  )) }) : null;
}
const dn = 1, Sa = 16, pl = 2.6, ba = 0.46, gl = 2.31, Ea = new nr(), Ma = new nr();
function ql(o, r) {
  let u = 0, c = 0;
  if ((o.KeyW || o.ArrowUp) && (u += 1), (o.KeyS || o.ArrowDown) && (u -= 1), (o.KeyD || o.ArrowRight) && (c += 1), (o.KeyA || o.ArrowLeft) && (c -= 1), u === 0 && c === 0) return new nr(0, 0, 0);
  Ea.set(-Math.sin(r), 0, -Math.cos(r)), Ma.set(Math.cos(r), 0, -Math.sin(r));
  const t = new nr();
  return t.addScaledVector(Ea, u), t.addScaledVector(Ma, c), t.lengthSq() < 1e-9 ? new nr(0, 0, 0) : t.normalize();
}
function Jl(o) {
  return o.lengthSq() < 1e-9 ? null : Math.atan2(-o.x, -o.z);
}
function bn(o) {
  let r = o % (Math.PI * 2);
  return r > Math.PI && (r -= Math.PI * 2), r <= -Math.PI && (r += Math.PI * 2), r;
}
function ml(o, r) {
  return bn(r - o);
}
function Ql(o, r, u, c) {
  const t = ml(o, r);
  if (Math.abs(t) < 1e-5) return bn(r);
  const e = 1 - Math.exp(-11 * c);
  return bn(o + t * e);
}
function $l(o, r, u, c) {
  return [
    Number((o[0] + r).toFixed(4)),
    Number(c.toFixed(4)),
    Number((o[2] + u).toFixed(4))
  ];
}
const yl = /(Shoulder|Arm|ForeArm|Hand)/;
function _l(o) {
  const r = o.split(".")[0];
  return /(Left|Right)/.test(r) ? yl.test(r) : !1;
}
function wl(o) {
  if (o && o !== Pa)
    return o;
}
function eu(o, r) {
  return o === "" && !!r;
}
function ru(o) {
  const u = (Math.min(
    Sa,
    Math.max(dn, o)
  ) - dn) / (Sa - dn), c = ba + u * (gl - ba);
  return pl * c;
}
function tu(o) {
  const r = Math.abs(o);
  return r < ri ? Pa : r >= ti ? ni : ai;
}
const xl = 1.7, Sl = 0.5, bl = 0.55, El = 0.5;
function nu(o, r) {
  return r ? Sl : o ? xl : 1;
}
function au(o, r = bl, u = El) {
  return o <= 0 || o >= u || u <= 0 ? 0 : 4 * r * o * (u - o) / (u * u);
}
function Ta(o) {
  let r = null;
  return o.traverse((u) => {
    !r && u instanceof Ba && (r = u);
  }), r;
}
function Ml(o, r, u) {
  const c = Zt(Ga), t = Ie.useMemo(() => Ta(o), [o]), e = Ie.useMemo(() => {
    const i = /* @__PURE__ */ new Map(), l = Ta(mo(c.scene));
    if (!t || !l) return i;
    for (const h of c.animations)
      try {
        const d = fl(t, l, h, { hip: "mixamorigHips" }), p = new La(
          d.name,
          d.duration,
          d.tracks.filter((g) => !_l(g.name)),
          d.blendMode
        );
        i.set(h.name, p);
      } catch (d) {
        console.warn(`Mannequin clip retarget failed: ${h.name}`, d);
      }
    return i;
  }, [c, t]), n = Ie.useRef(null), s = Ie.useRef(null), a = Ie.useRef(/* @__PURE__ */ new Map());
  Ie.useEffect(() => {
    if (!r) {
      s.current = null;
      return;
    }
    let i = n.current;
    i || (i = new Oa(t ?? o), n.current = i);
    const l = a.current;
    let h = l.get(r);
    if (!h) {
      const p = e.get(r);
      if (!p) {
        console.warn(`Mannequin locomotion clip unavailable: ${r}`);
        return;
      }
      h = i.clipAction(p), h.setLoop(oi, 1 / 0), l.set(r, h);
    }
    const d = s.current;
    d !== h && (h.enabled = !0, h.setEffectiveWeight(1), h.play(), d && (h.reset().play(), d.crossFadeTo(h, ii, !1)), s.current = h, u && (u.current = {
      setTime: (p) => {
        const g = n.current;
        g && g.setTime(p);
      }
    }));
  }, [r, e, t, u]), Ie.useEffect(() => () => {
    const i = n.current;
    i && i.stopAllAction(), n.current = null, a.current.clear(), s.current = null, u && (u.current = null);
  }, [u]), Xt((i, l) => {
    if (u) return;
    const h = n.current;
    !r || !h || !s.current || (h.update(l), yi(o), za(o));
  });
}
function Tl({ geometry: o }) {
  return o === "sphere" ? /* @__PURE__ */ J.jsx("sphereGeometry", { args: [0.55, 40, 24] }) : o === "cylinder" ? /* @__PURE__ */ J.jsx("cylinderGeometry", { args: [0.46, 0.46, 1.1, 40] }) : o === "plane" ? /* @__PURE__ */ J.jsx("planeGeometry", { args: [1, 1] }) : /* @__PURE__ */ J.jsx("boxGeometry", { args: [1, 1, 1] });
}
function ou({ color: o }) {
  return /* @__PURE__ */ J.jsxs("group", { children: [
    /* @__PURE__ */ J.jsxs("mesh", { position: [0, 0.41, 0], children: [
      /* @__PURE__ */ J.jsx("sphereGeometry", { args: [0.09, 24, 16] }),
      /* @__PURE__ */ J.jsx("meshStandardMaterial", { color: o, roughness: 0.55 })
    ] }),
    /* @__PURE__ */ J.jsxs("mesh", { position: [0, 0.12, 0], children: [
      /* @__PURE__ */ J.jsx("cylinderGeometry", { args: [0.11, 0.14, 0.4, 24] }),
      /* @__PURE__ */ J.jsx("meshStandardMaterial", { color: o, roughness: 0.62 })
    ] }),
    /* @__PURE__ */ J.jsxs("mesh", { position: [-0.24, 0.2, 0], rotation: [0, 0, Math.PI / 2], children: [
      /* @__PURE__ */ J.jsx("cylinderGeometry", { args: [0.032, 0.038, 0.36, 16] }),
      /* @__PURE__ */ J.jsx("meshStandardMaterial", { color: o, roughness: 0.62 })
    ] }),
    /* @__PURE__ */ J.jsxs("mesh", { position: [0.24, 0.2, 0], rotation: [0, 0, Math.PI / 2], children: [
      /* @__PURE__ */ J.jsx("cylinderGeometry", { args: [0.032, 0.038, 0.36, 16] }),
      /* @__PURE__ */ J.jsx("meshStandardMaterial", { color: o, roughness: 0.62 })
    ] }),
    /* @__PURE__ */ J.jsxs("mesh", { position: [-0.075, -0.28, 0], children: [
      /* @__PURE__ */ J.jsx("cylinderGeometry", { args: [0.038, 0.044, 0.46, 16] }),
      /* @__PURE__ */ J.jsx("meshStandardMaterial", { color: o, roughness: 0.62 })
    ] }),
    /* @__PURE__ */ J.jsxs("mesh", { position: [0.075, -0.28, 0], children: [
      /* @__PURE__ */ J.jsx("cylinderGeometry", { args: [0.038, 0.044, 0.46, 16] }),
      /* @__PURE__ */ J.jsx("meshStandardMaterial", { color: o, roughness: 0.62 })
    ] })
  ] });
}
class iu extends Ie.Component {
  constructor() {
    super(...arguments), this.state = { failed: !1 };
  }
  static getDerivedStateFromError() {
    return { failed: !0 };
  }
  componentDidCatch(r) {
    console.error("Failed to load mannequin GLB asset.", r);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function Ul({
  color: o,
  pose: r,
  activeClip: u,
  driverRef: c
}) {
  const { scene: t } = Zt(Na), e = Ie.useMemo(() => {
    const s = mo(t);
    _i(s);
    const a = wi(s), i = [];
    return a.traverse((l) => {
      if (!(l instanceof Xr)) return;
      l.castShadow = !0, l.receiveShadow = !0, l.frustumCulled = !1;
      const h = (d) => {
        const p = d.clone();
        return i.push(p), p;
      };
      l.material = Array.isArray(l.material) ? l.material.map(h) : h(l.material), l instanceof Ba && l.computeBoundingSphere();
    }), xi(a), { object: a, materials: i };
  }, [t]);
  Ie.useEffect(() => {
    const s = e.materials;
    return () => s.forEach((a) => a.dispose());
  }, [e]), Ie.useLayoutEffect(() => {
    e.materials.forEach((s) => {
      "color" in s && s.color instanceof tt && (s.color.set(o), s.needsUpdate = !0);
    });
  }, [o, e.materials]);
  const n = wl(u);
  return Ie.useLayoutEffect(() => {
    n || (Si(e.object, r), za(e.object));
  }, [e, r, n]), Ml(e.object, n, c), /* @__PURE__ */ J.jsx("primitive", { object: e.object });
}
Zt.preload(Na);
Zt.preload(Ga);
function Nn(o) {
  const r = Math.max(0.08, Math.abs(o.scale[0] || 1)), u = Math.max(0.08, Math.abs(o.scale[2] || 1));
  return Math.max(0.28, Math.max(0.78 * r, 0.54 * u) * 0.36);
}
function wo(o) {
  return bi(o) + Nn(o) * 2;
}
function zn(o, r) {
  const u = Ha(o), c = Va(o), t = wo(o), e = Math.floor(r / c), n = r % c, s = Math.max(1e-3, Math.abs(o.scale[0] || 1)), a = Math.max(1e-3, Math.abs(o.scale[2] || 1));
  return new nr(
    (n - (c - 1) / 2) * t / s,
    0,
    (e - (u - 1) / 2) * t / a
  );
}
function xo(o) {
  return Array.from({ length: Fn(o) }, (r, u) => zn(o, u));
}
const Cl = [
  { key: "head", geometry: "sphere", position: [0, 0.41, 0], scale: [0.09, 0.09, 0.09] },
  { key: "torso", geometry: "cylinder", position: [0, 0.12, 0], scale: [0.13, 0.4, 0.13] },
  { key: "left-arm", geometry: "cylinder", position: [-0.24, 0.2, 0], rotation: [0, 0, Math.PI / 2], scale: [0.036, 0.36, 0.036] },
  { key: "right-arm", geometry: "cylinder", position: [0.24, 0.2, 0], rotation: [0, 0, Math.PI / 2], scale: [0.036, 0.36, 0.036] },
  { key: "left-leg", geometry: "cylinder", position: [-0.075, -0.28, 0], scale: [0.041, 0.46, 0.041] },
  { key: "right-leg", geometry: "cylinder", position: [0.075, -0.28, 0], scale: [0.041, 0.46, 0.041] }
];
function Al({
  part: o,
  offsets: r,
  roleStartIndex: u
}) {
  const c = Ie.useRef(null), t = r.length, e = Ie.useMemo(() => new qr(), []), n = Ie.useMemo(() => new nr(), []), s = Ie.useMemo(() => new bt(), []), a = Ie.useMemo(() => new nr(), []), i = Ie.useMemo(() => new tt(), []);
  return Ie.useLayoutEffect(() => {
    const l = c.current;
    l && (l.count = t, r.forEach((h, d) => {
      n.set(
        h.x + o.position[0],
        h.y + o.position[1],
        h.z + o.position[2]
      ), s.setFromEuler(new Et(
        o.rotation?.[0] || 0,
        o.rotation?.[1] || 0,
        o.rotation?.[2] || 0
      )), a.fromArray(o.scale), e.compose(n, s, a), l.setMatrixAt(d, e), l.setColorAt(d, i.set(Wa(u + d)));
    }), l.instanceMatrix.needsUpdate = !0, l.instanceColor && (l.instanceColor.needsUpdate = !0), l.computeBoundingSphere());
  }, [i, t, e, r, o, n, u, s, a]), /* @__PURE__ */ J.jsxs("instancedMesh", { ref: c, args: [void 0, void 0, Math.max(1, t)], frustumCulled: !1, children: [
    o.geometry === "sphere" ? /* @__PURE__ */ J.jsx("sphereGeometry", { args: [1, sn, sn] }) : /* @__PURE__ */ J.jsx("cylinderGeometry", { args: [1, 1, 1, sn] }),
    /* @__PURE__ */ J.jsx("meshStandardMaterial", { roughness: 0.62 })
  ] });
}
function So({
  object: o,
  roleStartIndex: r
}) {
  const u = Ie.useMemo(() => xo(o), [
    o.crowdRows,
    o.crowdColumns,
    o.crowdSpacing,
    o.scale
  ]);
  return /* @__PURE__ */ J.jsx(J.Fragment, { children: Cl.map((c) => /* @__PURE__ */ J.jsx(
    Al,
    {
      part: c,
      offsets: u,
      roleStartIndex: r
    },
    c.key
  )) });
}
function su({
  object: o,
  roleStartIndex: r
}) {
  const u = Ie.useMemo(() => xo(o), [
    o.crowdRows,
    o.crowdColumns,
    o.crowdSpacing,
    o.scale
  ]);
  return u.length > si ? /* @__PURE__ */ J.jsx(So, { object: o, roleStartIndex: r }) : /* @__PURE__ */ J.jsx(J.Fragment, { children: u.map((c, t) => /* @__PURE__ */ J.jsx("group", { position: An(c), children: /* @__PURE__ */ J.jsx(Ul, { color: Wa(r + t), pose: o.pose }) }, `${o.id}-member-${t}`)) });
}
function lu({
  object: o,
  roleStartIndex: r
}) {
  return /* @__PURE__ */ J.jsx(So, { object: o, roleStartIndex: r });
}
function Fl({ object: o }) {
  const r = o.lightIntensity ?? 2, u = o.lightColor || "#ffffff";
  return o.lightType === "directional" ? /* @__PURE__ */ J.jsx("directionalLight", { color: u, intensity: r, position: [0, 0, 0] }) : o.lightType === "spot" ? /* @__PURE__ */ J.jsx("spotLight", { color: u, intensity: r, angle: 0.45, penumbra: 0.4 }) : /* @__PURE__ */ J.jsx("pointLight", { color: u, intensity: r, distance: 12 });
}
function uu({ object: o }) {
  return o.type === "light" ? /* @__PURE__ */ J.jsx(Fl, { object: o }) : o.type === "prop" ? /* @__PURE__ */ J.jsx(vl, { object: o }) : /* @__PURE__ */ J.jsxs("mesh", { children: [
    /* @__PURE__ */ J.jsx(Tl, { geometry: o.geometry }),
    /* @__PURE__ */ J.jsx(
      "meshStandardMaterial",
      {
        color: o.color || "#808080",
        roughness: 0.55,
        metalness: 0.04,
        side: o.geometry === "plane" ? Vt : li
      }
    )
  ] });
}
function bo(o) {
  return Math.max(0.8, Math.abs(o.scale[1] || 1) * ci);
}
function cu({ position: o, label: r }) {
  const u = Ie.useRef(null), { camera: c } = Pr(), t = Ie.useMemo(() => Math.max(0.72, r.length * 0.24 + 0.18), [r]);
  return Xt(() => {
    u.current?.quaternion.copy(c.quaternion);
  }), /* @__PURE__ */ J.jsxs(
    "group",
    {
      ref: u,
      position: o,
      raycast: () => null,
      userData: { [jt]: !0 },
      children: [
        /* @__PURE__ */ J.jsxs("mesh", { position: [0, 0, -0.012], raycast: () => null, renderOrder: 7, children: [
          /* @__PURE__ */ J.jsx("planeGeometry", { args: [t, 0.38] }),
          /* @__PURE__ */ J.jsx(
            "meshBasicMaterial",
            {
              color: "#111827",
              depthTest: !1,
              depthWrite: !1,
              opacity: 0.72,
              transparent: !0,
              toneMapped: !1
            }
          )
        ] }),
        /* @__PURE__ */ J.jsx(
          Hs,
          {
            anchorX: "center",
            anchorY: "middle",
            color: "#ffffff",
            fontSize: 0.28,
            fontWeight: 700,
            frustumCulled: !1,
            outlineColor: "#111827",
            outlineOpacity: 0.55,
            outlineWidth: 0.012,
            raycast: () => null,
            renderOrder: 8,
            children: r
          }
        )
      ]
    }
  );
}
function fu(o) {
  return [
    o.position[0],
    o.position[1] + bo(o),
    o.position[2]
  ];
}
function hu(o) {
  const r = Fn(o), u = new qr(), c = new Et(o.rotation[0], o.rotation[1], o.rotation[2]);
  u.compose(
    Nt(o.position),
    new bt().setFromEuler(c),
    Nt(o.scale)
  );
  const t = Math.max(1e-3, Math.abs(o.scale[1] || 1)), e = bo(o) / t;
  return Array.from({ length: r }, (n, s) => {
    const a = zn(o, s);
    return a.y = e, An(a.applyMatrix4(u));
  });
}
function Ua(o) {
  const r = Math.max(0.08, Math.abs(o.scale[0] || 1)), u = Math.max(0.08, Math.abs(o.scale[1] || 1)), c = Math.max(0.08, Math.abs(o.scale[2] || 1));
  if (o.type === "light") return { width: 0.42 * r, depth: 0.42 * c };
  if (o.type === "mannequinCrowd") {
    const t = Nn(o) * 2, e = wo(o);
    return {
      width: (Va(o) - 1) * e + t,
      depth: (Ha(o) - 1) * e + t
    };
  }
  if (o.type === "mannequin") return { width: 0.78 * r, depth: 0.54 * c };
  if (o.type === "prop" && o.propKind) {
    const t = mi(o.propKind);
    return { width: t.width * r, depth: t.depth * c };
  }
  return o.type === "model" || o.type === "group" ? { width: 1 * r, depth: 1 * c } : o.geometry === "sphere" ? { width: 1.1 * r, depth: 1.1 * c } : o.geometry === "cylinder" ? { width: 0.92 * r, depth: 0.92 * c } : o.geometry === "plane" ? { width: r, depth: u } : { width: r, depth: c };
}
function kl(o, r = o.scale) {
  const u = Math.max(0.08, Math.abs(r[1] || 1));
  return o.type === "light" ? 0.12 * u : o.type === "prop" ? 0 : o.type === "mannequin" || o.type === "mannequinCrowd" ? 0.5 * u : o.geometry === "sphere" || o.geometry === "cylinder" ? 0.55 * u : o.geometry === "plane" ? 0 : 0.5 * u;
}
function du(o) {
  return [
    o.position[0],
    o.position[1] - kl(o),
    o.position[2]
  ];
}
function vu(o, r) {
  const u = Ua(o), c = Math.max(u.width, u.depth) / 2, t = 0.45, e = r.map((i) => {
    const l = Ua(i);
    return {
      x: i.position[0],
      z: i.position[2],
      radius: Math.max(l.width, l.depth) / 2
    };
  }), n = (i, l) => e.every((h) => {
    const d = i - h.x, p = l - h.z;
    return Math.sqrt(d * d + p * p) >= c + h.radius + t;
  }), s = (i, l) => [
    Number(i.toFixed(4)),
    o.position[1],
    Number(l.toFixed(4))
  ];
  if (n(o.position[0], o.position[2])) return o.position;
  const a = Math.max(1.5, c * 2 + t);
  for (let i = 1; i <= 10; i += 1) {
    const l = [
      [i, 0],
      [-i, 0],
      [0, i],
      [0, -i],
      [i, i],
      [i, -i],
      [-i, i],
      [-i, -i]
    ];
    for (let h = 1; h < i; h += 1)
      l.push(
        [i, h],
        [i, -h],
        [-i, h],
        [-i, -h],
        [h, i],
        [-h, i],
        [h, -i],
        [-h, -i]
      );
    for (const [h, d] of l) {
      const p = h * a, g = d * a;
      if (n(p, g)) return s(p, g);
    }
  }
  return s((e.length + 1) * a, 0);
}
function Wn({ radius: o, segments: r = 72 }) {
  return /* @__PURE__ */ J.jsxs(J.Fragment, { children: [
    /* @__PURE__ */ J.jsx("ringGeometry", { args: [o * 0.92, o, r] }),
    /* @__PURE__ */ J.jsx(
      "meshBasicMaterial",
      {
        color: fi,
        depthWrite: !1,
        opacity: 0.8,
        side: Vt,
        transparent: !0,
        toneMapped: !1
      }
    )
  ] });
}
function Rl({
  position: o,
  radius: r
}) {
  return /* @__PURE__ */ J.jsx(
    "mesh",
    {
      position: [o[0], Cn, o[2]],
      raycast: () => null,
      renderOrder: 3,
      rotation: [-Math.PI / 2, 0, 0],
      userData: { [jt]: !0 },
      children: /* @__PURE__ */ J.jsx(Wn, { radius: r })
    }
  );
}
function Dl({ runtimeId: o, radius: r }) {
  const u = Ie.useRef(null), { scene: c } = Pr(), t = Ie.useRef(null), e = Ie.useMemo(() => new nr(), []);
  return Ie.useLayoutEffect(() => {
    t.current = null;
  }, [o]), Xt(() => {
    const n = u.current;
    if (!n) return;
    let s = t.current;
    (!s || !s.parent) && (s = Ei(c, o), t.current = s), s && (s.getWorldPosition(e), n.position.set(e.x, Cn, e.z));
  }), /* @__PURE__ */ J.jsx(
    "mesh",
    {
      ref: u,
      raycast: () => null,
      renderOrder: 3,
      rotation: [-Math.PI / 2, 0, 0],
      userData: { [jt]: !0 },
      children: /* @__PURE__ */ J.jsx(Wn, { radius: r })
    }
  );
}
function Il({
  positions: o,
  radius: r
}) {
  const u = Ie.useRef(null), c = o.length, t = Ie.useMemo(() => new qr(), []), e = Ie.useMemo(() => new nr(), []), n = Ie.useMemo(() => new bt().setFromEuler(new Et(-Math.PI / 2, 0, 0)), []), s = Ie.useMemo(() => new nr(1, 1, 1), []);
  return Ie.useLayoutEffect(() => {
    const a = u.current;
    a && (a.count = c, o.forEach((i, l) => {
      e.set(i[0], Cn, i[2]), t.compose(e, n, s), a.setMatrixAt(l, t);
    }), a.instanceMatrix.needsUpdate = !0, a.computeBoundingSphere());
  }, [c, t, e, o, n, s]), /* @__PURE__ */ J.jsx(
    "instancedMesh",
    {
      ref: u,
      args: [void 0, void 0, Math.max(1, c)],
      raycast: () => null,
      renderOrder: 3,
      userData: { [jt]: !0 },
      children: /* @__PURE__ */ J.jsx(Wn, { radius: r, segments: ui })
    }
  );
}
function pu({
  object: o,
  possessed: r
}) {
  const u = Nn(o), c = Ie.useMemo(() => {
    if (o.type !== "mannequinCrowd") return [];
    const t = new qr();
    return t.compose(
      Nt(o.position),
      new bt().setFromEuler(new Et(o.rotation[0], o.rotation[1], o.rotation[2])),
      Nt(o.scale)
    ), Array.from({ length: Fn(o) }, (e, n) => An(zn(o, n).applyMatrix4(t)));
  }, [
    o.crowdRows,
    o.crowdColumns,
    o.crowdSpacing,
    o.position,
    o.rotation,
    o.scale
  ]);
  return o.type !== "mannequin" && o.type !== "mannequinCrowd" ? null : o.type === "mannequin" ? r ? /* @__PURE__ */ J.jsx(Dl, { runtimeId: o.id, radius: u }) : /* @__PURE__ */ J.jsx(Rl, { position: [o.position[0], 0, o.position[2]], radius: u }) : /* @__PURE__ */ J.jsx(Il, { positions: c, radius: u });
}
const Ol = Math.PI, Ll = 128, Pl = 64;
class Eo extends Ie.Component {
  constructor() {
    super(...arguments), this.state = { hasError: !1 };
  }
  static getDerivedStateFromError() {
    return { hasError: !0 };
  }
  componentDidUpdate(r) {
    r.resetKey !== this.props.resetKey && this.state.hasError && this.setState({ hasError: !1 });
  }
  componentDidCatch(r) {
    console.warn("[nomi] 3D scene environment failed to load; using fallback lighting.", r);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
function Wt(o) {
  return o + Ol;
}
function En(o) {
  const r = wt(pi, o), u = Ie.useMemo(() => r.clone(), [r]);
  return Ie.useEffect(() => () => {
    u.dispose();
  }, [u]), u;
}
function Mn(o, r = 1) {
  o.colorSpace = Ia, o.wrapS = di, o.wrapT = Nr, o.magFilter = Ur, o.minFilter = vi, o.anisotropy = r, o.needsUpdate = !0;
}
function Bl({
  url: o,
  rotation: r
}) {
  const u = En(o), c = Pr((t) => t.gl);
  return Ie.useLayoutEffect(() => {
    Mn(u, c.capabilities.getMaxAnisotropy()), u.mapping = Un, u.needsUpdate = !0;
  }, [c, u]), /* @__PURE__ */ J.jsx(
    go,
    {
      background: !0,
      map: u,
      backgroundRotation: [0, Wt(r), 0],
      environmentRotation: [0, Wt(r), 0],
      environmentIntensity: 0.82
    }
  );
}
function Gl({
  darkMode: o
}) {
  return /* @__PURE__ */ J.jsxs(J.Fragment, { children: [
    /* @__PURE__ */ J.jsx(
      "hemisphereLight",
      {
        args: o ? ["#8fa8ff", "#10131f", 0.55] : ["#f8fbff", "#d8c9b0", 0.8]
      }
    ),
    /* @__PURE__ */ J.jsx(
      "directionalLight",
      {
        castShadow: !1,
        intensity: o ? 1.1 : 1.35,
        position: [4, 7, 5]
      }
    ),
    /* @__PURE__ */ J.jsx(
      "directionalLight",
      {
        castShadow: !1,
        color: o ? "#8fb3ff" : "#c8ddff",
        intensity: o ? 0.35 : 0.28,
        position: [-5, 3, -4]
      }
    )
  ] });
}
function Nl({
  url: o,
  rotation: r,
  radius: u
}) {
  const c = En(o), t = En(o), e = Pr((s) => s.gl), n = Ie.useMemo(() => {
    const s = new hi(u, Ll, Pl), a = s.attributes.uv;
    for (let i = 0; i < a.count; i++)
      a.setX(i, 1 - a.getX(i));
    return a.needsUpdate = !0, s;
  }, [u]);
  return Ie.useLayoutEffect(() => {
    Mn(c, e.capabilities.getMaxAnisotropy()), c.mapping = _t, c.needsUpdate = !0;
  }, [e, c]), Ie.useLayoutEffect(() => {
    Mn(t, e.capabilities.getMaxAnisotropy()), t.mapping = Un, t.needsUpdate = !0;
  }, [t, e]), /* @__PURE__ */ J.jsxs(J.Fragment, { children: [
    /* @__PURE__ */ J.jsx(
      go,
      {
        map: t,
        background: !1,
        environmentRotation: [0, Wt(r), 0],
        environmentIntensity: 0.82
      }
    ),
    /* @__PURE__ */ J.jsx("mesh", { geometry: n, rotation: [0, Wt(r), 0], children: /* @__PURE__ */ J.jsx("meshBasicMaterial", { map: c, side: Ca, toneMapped: !1 }) })
  ] });
}
function zl({
  url: o,
  rotation: r,
  radius: u,
  fallback: c
}) {
  return /* @__PURE__ */ J.jsx(Eo, { fallback: c, resetKey: o, children: /* @__PURE__ */ J.jsx(Ie.Suspense, { fallback: c, children: /* @__PURE__ */ J.jsx(Nl, { url: o, rotation: r, radius: u }) }) });
}
function Wl({
  url: o,
  rotation: r,
  fallback: u
}) {
  return /* @__PURE__ */ J.jsx(Eo, { fallback: u, resetKey: o, children: /* @__PURE__ */ J.jsx(Ie.Suspense, { fallback: u, children: /* @__PURE__ */ J.jsx(Bl, { url: o, rotation: r }) }) });
}
function gu({
  environment: o,
  ambientIntensity: r = 0.65
}) {
  const u = o.panoramaUrl;
  return /* @__PURE__ */ J.jsxs(J.Fragment, { children: [
    !u || o.environmentMode === "sphere" ? /* @__PURE__ */ J.jsx("color", { attach: "background", args: [o.backgroundColor] }) : null,
    /* @__PURE__ */ J.jsx("ambientLight", { intensity: r }),
    /* @__PURE__ */ J.jsx(Gl, { darkMode: o.darkMode }),
    !u && o.showSky ? /* @__PURE__ */ J.jsx(ul, { sunPosition: [2, 1, 4] }) : null,
    u && o.environmentMode === "sphere" ? /* @__PURE__ */ J.jsx(
      zl,
      {
        url: u,
        rotation: o.panoramaRotation,
        radius: o.sphereRadius,
        fallback: /* @__PURE__ */ J.jsx("color", { attach: "background", args: [o.backgroundColor] })
      }
    ) : u ? /* @__PURE__ */ J.jsx(
      Wl,
      {
        url: u,
        rotation: o.panoramaRotation,
        fallback: /* @__PURE__ */ J.jsx("color", { attach: "background", args: [o.backgroundColor] })
      }
    ) : null
  ] });
}
export {
  El as C,
  Fl as L,
  Ul as M,
  ou as P,
  gu as S,
  iu as a,
  su as b,
  pu as c,
  cu as d,
  lu as e,
  uu as f,
  $l as g,
  hu as h,
  Ql as i,
  Jl as j,
  ql as k,
  ru as l,
  nu as m,
  au as n,
  wl as o,
  tu as p,
  vu as q,
  Ua as r,
  du as s,
  kl as t,
  eu as u,
  fu as v
};
