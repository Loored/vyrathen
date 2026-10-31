import {expect,type Page} from '@playwright/test';
/** Measure actual nontransparent sprite pixels, transformed through the rendered SVG.
 * Works on the base pilot too; labels and full transparent image boxes cannot satisfy it. */
export async function renderedBodies(page:Page){
  return page.locator('.vyr-pilot-world').evaluate(async world=>{
    const result=[];
    const groups=[...world.querySelectorAll<SVGGElement>('[data-render-id]')].filter(group=>Number(getComputedStyle(group.closest('.vyr-pilot-beat')!).opacity)>=.5);
    for(const group of groups){
      const beat=group.closest('.vyr-pilot-beat')!;
      const svg=group.querySelector('svg'),image=svg?.querySelector('image');if(!svg||!image)continue;
      const im=new Image();im.src=image.getAttribute('href')!;await im.decode();
      const vb=svg.viewBox.baseVal,c=document.createElement('canvas');c.width=vb.width;c.height=vb.height;
      c.getContext('2d')!.drawImage(im,Number(image.getAttribute('x')),Number(image.getAttribute('y')));
      const pixels=c.getContext('2d')!.getImageData(0,0,c.width,c.height).data;
      let left=c.width,top=c.height,right=0,bottom=0,count=0;
      for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++)if(pixels[(y*c.width+x)*4+3]>32){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x+1);bottom=Math.max(bottom,y+1);count++;}
      const matrix=svg.getScreenCTM()!,a=new DOMPoint(left,top).matrixTransform(matrix),b=new DOMPoint(right,bottom).matrixTransform(matrix);
      result.push({id:group.dataset.renderId,step:beat.getAttribute('data-clip-step')??beat.getAttribute('data-beat'),src:im.src.split('/').pop(),pixels:count,local:{left,top,right,bottom,width:c.width,height:c.height},screen:{left:a.x,top:a.y,right:b.x,bottom:b.y}});
    }
    return result;
  });
}
export async function frameFullScene(page:Page){
  const scene=page.getByLabel('Escena piloto 2D');
  await scene.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
  const bounds=await scene.boundingBox();expect(bounds).not.toBeNull();
  expect(bounds!.y).toBeGreaterThanOrEqual(0);expect(bounds!.y+bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height+1);
  const bodies=await renderedBodies(page);expect(bodies).toHaveLength(2);
  for(const body of bodies){
    expect(body.pixels).toBeGreaterThan(1000);
    expect(body.screen.left).toBeGreaterThanOrEqual(bounds!.x-1);expect(body.screen.right).toBeLessThanOrEqual(bounds!.x+bounds!.width+1);
    expect(body.screen.top).toBeGreaterThanOrEqual(bounds!.y-1);expect(body.screen.bottom).toBeLessThanOrEqual(bounds!.y+bounds!.height+1);
  }
  return bodies;
}
