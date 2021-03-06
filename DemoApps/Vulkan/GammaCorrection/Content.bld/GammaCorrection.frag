#version 310 es
/****************************************************************************************************************************************************
 *This is free and unencumbered software released into the public domain.
 *
 *Anyone is free to copy, modify, publish, use, compile, sell, or
 *distribute this software, either in source code form or as a compiled
 *binary, for any purpose, commercial or non-commercial, and by any
 *means.
 *
 *In jurisdictions that recognize copyright laws, the author or authors
 *of this software dedicate any and all copyright interest in the
 *software to the public domain. We make this dedication for the benefit
 *of the public at large and to the detriment of our heirs and
 *successors. We intend this dedication to be an overt act of
 *relinquishment in perpetuity of all present and future rights to this
 *software under copyright law.
 *
 *THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 *IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 *OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 *ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 *OTHER DEALINGS IN THE SOFTWARE.
 *
 *For more information, please refer to <http://unlicense.org>
 ****************************************************************************************************************************************************/

// ShaderCode based on the OpenGL Tutorial https://learnopengl.com/#!Advanced-Lighting/Gamma-Correction

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

layout(std140, binding = 2) uniform UBO
{
  uniform vec3 LightPositions[4];
  uniform vec3 LightColors[4];
  uniform vec3 ViewPos;
}
g_ubo;

layout(location = 0) in vec3 v_Position;
layout(location = 1) in vec3 v_Normal;
layout(location = 2) in vec2 v_TexCoord;

layout(binding = 1) uniform sampler2D floorTexture;

layout(location = 0) out vec4 FragColor;

vec3 BlinnPhong(vec3 normal, vec3 fragPos, vec3 lightPos, vec3 lightColor)
{
  // diffuse
  vec3 lightDir = normalize(lightPos - fragPos);
  float diff = max(dot(lightDir, normal), 0.0);
  vec3 diffuse = diff * lightColor;
  // specular
  vec3 viewDir = normalize(g_ubo.ViewPos - fragPos);
  vec3 reflectDir = reflect(-lightDir, normal);
  float spec = 0.0;
  vec3 halfwayDir = normalize(lightDir + viewDir);
  spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);
  vec3 specular = spec * lightColor;
  // simple attenuation
  float max_distance = 1.5;
  float distance = length(lightPos - fragPos);
  float attenuation = 1.0 / distance;

  diffuse *= attenuation;
  specular *= attenuation;

  return diffuse + specular;
}

void main()
{
  vec3 color = texture(floorTexture, v_TexCoord).rgb;
  vec3 lighting = vec3(0.0);
  for (int i = 0; i < 4; ++i)
    lighting += BlinnPhong(normalize(v_Normal), v_Position, g_ubo.LightPositions[i], g_ubo.LightColors[i]);
  color *= lighting;
  FragColor = vec4(color, 1.0);
}