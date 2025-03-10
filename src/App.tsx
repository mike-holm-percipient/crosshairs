import * as React from 'react';
import {useState} from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import {Stack} from "@mui/material";
import {JSX} from 'react/jsx-runtime';


function getNativeEvent(e: React.MouseEvent): MouseEvent {
  return e.nativeEvent;
}

export default function App() {
  const [svgOffset, captureSvgOffsetPair] = useOffsetPair([0, 0]);
  const [square, capturePoint1, capturePoint2] = useSquare();

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
          width="100%"
          src='/hats-lo.jpg'
          alt='two men in blue hard hats'
        />
        <svg
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%'
          }}
          onMouseMove={e => {
            captureSvgOffsetPair(e)
            if(e.buttons === 1) capturePoint2(e)
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

function useSquare(init1?: Pair, init2?: Pair): [[Pair, Pair], MouseEventHandler, MouseEventHandler] {
  const [pair1, setPair1] = usePair(init1)
  const [pair2, setPair2, reset2] = usePair(init2)

  function capturePair1(e: React.MouseEvent) {
    const target = getNativeEvent(e);
    const x: number = target[`${offsetPairPrefix}X`];
    const y: number = target[`${offsetPairPrefix}Y`];
    setPair1([x, y]);
    setPair2([x, y]);
  }

  function capturePair2(e: React.MouseEvent) {
    const target = getNativeEvent(e);
    const x: number = target[`${offsetPairPrefix}X`];
    const y: number = target[`${offsetPairPrefix}Y`];
    setPair2([x, y]);
  }

  return [[pair1, pair2], capturePair1, capturePair2]
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

