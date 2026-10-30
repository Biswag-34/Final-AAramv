import {Children, Fragment, cloneElement, isValidElement, type HTMLAttributes, type ReactNode, type ReactElement} from 'react';

type ChildProps={children?:ReactNode;className?:string};

function alreadyEmphasized(children:ReactNode):boolean {
  return Children.toArray(children).some(child=>isValidElement<ChildProps>(child)&&(child.type==='em'||alreadyEmphasized(child.props.children)));
}

/** Preserve the original wording and markup, accenting the final phrase. */
function emphasize(children:ReactNode):ReactNode {
  if(alreadyEmphasized(children))return children;
  const alternatives=Children.toArray(children);
  if(alternatives.length>1&&alternatives.every(child=>isValidElement<ChildProps>(child)&&/\b(?:mobile-only|desktop-only)\b/.test(child.props.className||''))) {
    return alternatives.map(child=>{const element=child as ReactElement<ChildProps>;return cloneElement(element,{},emphasize(element.props.children));});
  }
  let last=-1,index=0;
  const inspect=(nodes:ReactNode)=>Children.forEach(nodes,node=>{
    if(typeof node==='string'){if(/\p{L}/u.test(node))last=index;index++;}
    else if(isValidElement<ChildProps>(node))inspect(node.props.children);
  });
  inspect(children);index=0;
  const render=(nodes:ReactNode):ReactNode=>Children.map(nodes,node=>{
    if(typeof node==='string'){
      if(index++!==last)return node;
      const words=[...node.matchAll(/\S+/g)];
      if(!words.length)return node;
      const count=words.length>=5?2:1,start=words[Math.max(0,words.length-count)].index!;
      return <Fragment>{node.slice(0,start)}<em className="heading-accent">{node.slice(start)}</em></Fragment>;
    }
    return isValidElement<ChildProps>(node)&&node.props.children!==undefined?cloneElement(node,{},render(node.props.children)):node;
  });
  return render(children);
}

export function EditorialHeading({as:Tag='h2',children,className='',preserve=false,...props}:HTMLAttributes<HTMLHeadingElement>&{as?:'h1'|'h2'|'h3'|'h4';preserve?:boolean}) {
  // Catalogue names keep their existing font, weight, colour and markup.
  if(preserve)return <Tag {...props} className={className||undefined} data-entity-heading>{children}</Tag>;
  return <Tag {...props} className={`editorial-heading ${className}`.trim()}>{emphasize(children)}</Tag>;
}

export function EditorialText({children,preserve=false}:{children:ReactNode;preserve?:boolean}) {
  if(preserve)return <>{children}</>;
  return <span className="editorial-title-text">{emphasize(children)}</span>;
}
