#!/usr/bin/env python3
"""Generate a lightweight 5-second cloud damage loader using stdlib + ffmpeg."""
import math, os, subprocess, sys
W,H,FPS,N=384,216,12,60
def cloud(buffer,cx,cy,sx,sy,colour,alpha):
 xlo=max(0,int(cx-sx-3));xhi=min(W,int(cx+sx+3))
 ylo=max(0,int(cy-sy-3));yhi=min(H,int(cy+sy+3))
 if xlo>=xhi or ylo>=yhi:return
 for y in range(ylo,yhi):
  dy=((y-cy)/sy)**2
  if dy>1:continue
  stride=y*W*3
  for x in range(xlo,xhi):
   d=dy+((x-cx)/sx)**2
   if d>=1:continue
   opacity=alpha*(1-min(1,max(0,(d-.71)/.29)))
   o=stride+3*x
   for k in range(3):buffer[o+k]=int(buffer[o+k]*(1-opacity)+colour[k]*opacity)
def line(buf,x0,y0,x1,y1,width,colour):
 vx=x1-x0;vy=y1-y0;ll=max(1,vx*vx+vy*vy)
 for y in range(max(0,int(min(y0,y1)-width-2)),min(H,int(max(y0,y1)+width+2))):
  for x in range(max(0,int(min(x0,x1)-width-2)),min(W,int(max(x0,x1)+width+2))):
   t=max(0,min(1,((x-x0)*vx+(y-y0)*vy)/ll));px=x0+t*vx;py=y0+t*vy
   if (x-px)**2+(y-py)**2<width**2:
    o=(y*W+x)*3
    for k in range(3):buf[o+k]=int(.2*buf[o+k]+.8*colour[k])
def frame(t):
 pixels=bytearray(W*H*3)
 for y in range(H):
  for x in range(W):
   pos=(y*W+x)*3
   aura=max(0,1-math.hypot((x-W*.49)/(W*.63),(y-H*.45)/(H*.7)))
   pixels[pos]=int(11+24*aura)
   pixels[pos+1]=int(23+40*aura)
   pixels[pos+2]=int(40+65*aura)
 drift=26*math.sin(2*math.pi*t/5);colour=(211,230,243)
 for cx,cy,sx,sy,a in [(-7,119,80,41,.65),(56,139,82,45,.88),(110,113,78,50,.95),
  (158,143,75,45,.83),(227,123,91,52,.9),(306,132,87,50,.92),
  (384,121,82,47,.61),(191,87,72,53,.52)]:
  cloud(pixels,cx+drift,cy+3*math.sin(3*t+cx),sx,sy,colour,a)
 shimmer=(math.sin(t*6.8)**9 if math.sin(t*6.8)>0 else 0)
 if shimmer>.16:
  points=[(215,41),(199,81),(215,83),(188,130),(200,103),(186,98)]
  for u,v in zip(points,points[1:]):line(pixels,*u,*v,1.7+2*shimmer,(254,211,105))
 return pixels
def main(dest):
 cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo',
  '-pixel_format','rgb24','-video_size',f'{W}x{H}','-framerate',str(FPS),
  '-i','pipe:0','-an','-c:v','libvpx','-deadline','realtime','-cpu-used','6',
  '-b:v','160k','-pix_fmt','yuv420p',dest]
 os.makedirs(os.path.dirname(os.path.abspath(dest)),exist_ok=True)
 proc=subprocess.Popen(cmd,stdin=subprocess.PIPE)
 try:
  for i in range(N):proc.stdin.write(frame(i/FPS))
  proc.stdin.close()
  code=proc.wait(timeout=75)
  if code:raise RuntimeError('ffmpeg exited '+str(code))
 finally:
  if proc.poll() is None:proc.kill();proc.wait()
 print('cloud-loader WebM:',dest,os.stat(dest).st_size,'bytes')
if __name__=='__main__':main(sys.argv[1])
