import * as React from 'react';
import {useRef, useState} from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import {Stack} from "@mui/material";
import {JSX} from 'react/jsx-runtime';


export default function App() {
  const [svgOffset, captureSvgOffsetPair] = useOffsetPair([0, 0]);
  const [square, capturePoint1, capturePoint2, imgRef, svgRef] = useSquare();

  const [x, y] = svgOffset
  return (
    <Container maxWidth="lg" sx={{background: '#ccc', p: 2}}>
      <Typography variant="h4" component="h1" sx={{mb: 2}}>
        {`svg offset: ${JSON.stringify(svgOffset)}`}
      </Typography>
      <Typography variant="h4" component="h1" sx={{mb: 2}}>
        {`square: ${JSON.stringify(square)}`}
      </Typography>
      <Stack
        sx={{
          position: 'relative',
          backgroundColor: '#333'
        }}
        justifyContent='center'
        alignItems="center"
        p={8}>
        <img
          style={{ userSelect: 'none' }}
          width="100%"
          src='/hats-lo.jpg'
          alt='two men in blue hard hats'
          ref={imgRef}
        />
        <svg
          ref={svgRef}
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%'
          }}
          onResize={e => {debugger;}}
          onMouseMove={e => {
            captureSvgOffsetPair(e)
            if(isDragging(e)) capturePoint2(e)
          }}
          onMouseLeave={captureSvgOffsetPair}
          onMouseDown={capturePoint1}
          onMouseUp={capturePoint2}
        >
          <VerticalLine x={x}/>
          <HorizontalLine y={y}/>
          <Rect square={square} />
        </svg>
      </Stack>
    </Container>
  );
}

function Rect({square, ...rest}: {square: [Pair, Pair]}) {
  const x1 = square[0][0];
  const y1 = square[0][1];
  const x2 = square[1][0];
  const y2 = square[1][1];
  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const width = Math.abs(x2-x1);
  const height = Math.abs(y2 - y1)
  return <rect x={x} y={y} width={width} height={height} stroke='red' fill='none' strokeWidth={3} {...rest} />
}

const dash = 4;
function Line(props: JSX.IntrinsicAttributes & React.SVGLineElementAttributes<SVGLineElement>) {
  return <line stroke='white' strokeDasharray={dash} {...props} />
}

function HorizontalLine({
                          y,
                          ...rest
                        }: JSX.IntrinsicAttributes & React.SVGLineElementAttributes<SVGLineElement> & {
  y: number
}) {
  return <Line x1={0} y1={y} x2='100%' y2={y} {...rest} />
}

function VerticalLine({
                        x,
                        ...rest
                      }: JSX.IntrinsicAttributes & React.SVGLineElementAttributes<SVGLineElement> & {
  x: number
}) {
  return <Line x1={x} y1={0} x2={x} y2='100%' {...rest} />
}

type Pair = [number, number]

function usePair(init: [number, number] = [0, 0]): [Pair, React.Dispatch<React.SetStateAction<Pair>>, () => void] {
  const [pair, setPair] = useState<[number, number]>(init);
  return [pair, setPair, () => setPair(init)]
}

function getOffsetPair(e: React.MouseEvent): Pair {
  const target = getNativeEvent(e);
  const x: number = target[`${offsetPairPrefix}X`];
  const y: number = target[`${offsetPairPrefix}Y`];
  return [x, y];
}

function useSquare(init1?: Pair, init2?: Pair): [[Pair, Pair], MouseEventHandler, MouseEventHandler, React.Ref<any>, React.Ref<any>] {
  const [pair1, setPair1] = usePair(init1)
  const [pair2, setPair2] = usePair(init2)
  const imgRef = useRef<HTMLImageElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  function clampToImgBounds([x1, y1]: Pair): Pair {
    const imgRect = imgRef.current?.getBoundingClientRect();
    const svgRect = svgRef.current?.getBoundingClientRect();
    const imgLeft = imgRect?.left ?? 0;
    const imgTop = imgRect?.top ?? 0;
    const imgRight = imgRect?.right ?? 0;
    const svgLeft = svgRect?.left ?? 0;
    const svgTop = svgRect?.top ?? 0;
    const imgBottom = imgRect?.bottom ?? 0;
    const minX = imgLeft - svgLeft
    const minY = imgTop - svgTop
    const maxX = imgRight - svgLeft
    const maxY = imgBottom - svgTop
    const clampedX = Math.min(Math.max(x1, minX), maxX);
    const clampedY = Math.min(Math.max(y1, minY), maxY);
    return [clampedX, clampedY];
  }

  function capturePair1(e: React.MouseEvent) {
    const [x,y] = clampToImgBounds(getOffsetPair(e));
    setPair1([x, y]);
    setPair2([x, y]);
  }

  function capturePair2(e: React.MouseEvent) {
    const [x,y] = clampToImgBounds(getOffsetPair(e));
    setPair2([x, y]);
  }

  return [[pair1, pair2], capturePair1, capturePair2, imgRef, svgRef]
}

const offsetPairPrefix = 'offset';
type MouseEventHandler = (e: React.MouseEvent) => void;

function useOffsetPair(init: [number, number] | undefined): [Pair, MouseEventHandler] {
  const [pair, setPair] = usePair(init)

  function captureSvgOffsetPair(e: React.MouseEvent) {
    const target = getNativeEvent(e);
    const x: number = target[`${offsetPairPrefix}X`];
    const y: number = target[`${offsetPairPrefix}Y`];
    setPair([x, y]);
  }

  return [pair, captureSvgOffsetPair];
}

function getNativeEvent(e: React.MouseEvent): MouseEvent {
  return e.nativeEvent;
}

function isDragging(e: React.MouseEvent<SVGSVGElement>) {
  return e.buttons === 1;
}

