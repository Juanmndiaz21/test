export default function BisSkinCleaner() {
    return (
        <script
            dangerouslySetInnerHTML={{
                __html: `(function(){if(typeof window==='undefined')return;try{var clean=function(n){if(!n||n.nodeType!==1)return;if(n.hasAttribute('bis_skin_checked'))n.removeAttribute('bis_skin_checked');if(n.querySelectorAll){var e=n.querySelectorAll('[bis_skin_checked]');for(var i=0;i<e.length;i++)e[i].removeAttribute('bis_skin_checked');}};if(typeof MutationObserver!=='undefined'){var o=new MutationObserver(function(m){for(var i=0;i<m.length;i++){var x=m[i];if(x.type==='attributes'&&x.attributeName==='bis_skin_checked'){x.target.removeAttribute('bis_skin_checked');}else if(x.type==='childList'){for(var j=0;j<x.addedNodes.length;j++)clean(x.addedNodes[j]);}}});var t=document.documentElement||document;if(t){o.observe(t,{attributes:true,subtree:true,childList:true,attributeFilter:['bis_skin_checked']});}}if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',function(){clean(document.documentElement);});}else{clean(document.documentElement);}}catch(e){}})();`,
            }}
        />
    );
}
