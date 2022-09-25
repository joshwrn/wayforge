import { css } from "@emotion/react"

export const skeletalJsonEditorCss = css`
  input {
    font-size: 20px;
    font-family: theia;
    border: none;
    border-bottom: 1px solid;
    background: none;
    &:disabled {
      border: none;
    }
  }
  button {
    background: none;
    margin-left: auto;
    color: #777;
    border: none;
    font-family: theia;
    font-size: 14px;
    margin: none;
    padding: 4px;
    padding-bottom: 6px;
    cursor: pointer;
    &:hover {
      color: #333;
      background-color: #aaa;
    }
  }
  select {
    font-family: theia;
    font-size: 14px;
    background: none;
    border: none;
    color: #777;
    @media (prefers-color-scheme: light) {
      color: #999;
    }
  }
  .json_editor_unofficial {
    background-color: #777;
    button {
      color: #333;
    }
  }
  .json_editor_missing {
    background-color: #f055;
  }
  .json_editor_key {
    input {
      color: #999;
      @media (prefers-color-scheme: light) {
        color: #777;
      }
    }
  }
  .json_editor_object {
    border-left: 2px solid #333;
    padding-left: 20px;
    @media (prefers-color-scheme: light) {
      border-color: #ccc;
    }
    .json_editor_properties {
      > * {
        border-bottom: 2px solid #333;
        margin-bottom: 2px;
      }
    }
  }
`
