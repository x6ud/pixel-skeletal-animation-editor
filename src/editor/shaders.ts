import Renderer from '../utils/Renderer'

import multiplyAlphaFrag from '../shaders/multiply-alpha.frag'
import brushIndicatorFrag from '../shaders/brush-indicator.frag'
import transparentBackgroundFrag from '../shaders/transparent-background.frag'
import x3brFrag from '../shaders/x3br.frag'
import downscale3xFrag from '../shaders/downscale3x.frag'

const renderer = Renderer.instance();

export const multiplyAlphaShader = renderer.createShader(undefined, multiplyAlphaFrag);
export const brushIndicatorShader = renderer.createShader(undefined, brushIndicatorFrag);
export const transparentBackgroundShader = renderer.createShader(undefined, transparentBackgroundFrag);
export const x3brShader = renderer.createShader(undefined, x3brFrag);
export const downscale3xShader = renderer.createShader(undefined, downscale3xFrag);
