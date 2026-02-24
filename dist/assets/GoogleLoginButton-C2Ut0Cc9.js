import{r as u,j as e}from"./vendor-query-CBvMvuoP.js";import{a as p,b as h,c as f}from"./index-CmB4qfak.js";import{aq as x}from"./vendor-icons-D67mGtX1.js";function m({className:t}){return e.jsxs("svg",{className:t,viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[e.jsx("path",{d:"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z",fill:"#4285F4"}),e.jsx("path",{d:"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z",fill:"#34A853"}),e.jsx("path",{d:"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z",fill:"#FBBC05"}),e.jsx("path",{d:"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z",fill:"#EA4335"})]})}function w({mode:t="login",className:i=""}){const[r,o]=u.useState(!1),l=p(s=>s.loginWithGoogle),n=h(),a=f({onSuccess:async s=>{o(!0);try{await l(s.access_token)&&n.success("Successfully signed in with Google")}catch{n.error("Google sign-in failed. Please try again.")}finally{o(!1)}},onError:s=>{n.error("Google sign-in failed. Please try again."),o(!1)}}),c=()=>{r||(o(!0),a())},g=t==="signup"?"Sign up with Google":"Continue with Google";return e.jsx("button",{type:"button",onClick:c,disabled:r,className:`
        w-full py-3 px-4
        bg-tvp-bg-tertiary hover:bg-tvp-bg-tertiary/80
        border border-tvp-border-default hover:border-tvp-border-hover
        text-tvp-text-primary font-medium
        rounded-xl
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        flex items-center justify-center gap-3
        ${i}
      `,children:r?e.jsxs(e.Fragment,{children:[e.jsx(x,{className:"w-5 h-5 animate-spin"}),e.jsx("span",{children:"Signing in..."})]}):e.jsxs(e.Fragment,{children:[e.jsx(m,{className:"w-5 h-5"}),e.jsx("span",{children:g})]})})}export{w as G};
