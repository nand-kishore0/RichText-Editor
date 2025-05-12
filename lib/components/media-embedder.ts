export class MediaEmbedder {
  private editor: any
  private dialog: HTMLElement | null = null
  private mediaTypes = [
    { name: "YouTube", value: "youtube", placeholder: "https://www.youtube.com/watch?v=VIDEO_ID" },
    { name: "Vimeo", value: "vimeo", placeholder: "https://vimeo.com/VIDEO_ID" },
    { name: "Twitter", value: "twitter", placeholder: "https://twitter.com/username/status/TWEET_ID" },
    { name: "Instagram", value: "instagram", placeholder: "https://www.instagram.com/p/POST_ID/" },
    { name: "SoundCloud", value: "soundcloud", placeholder: "https://soundcloud.com/artist/track" },
    { name: "Spotify", value: "spotify", placeholder: "https://open.spotify.com/track/TRACK_ID" },
    { name: "Google Maps", value: "googlemaps", placeholder: "https://www.google.com/maps?q=LOCATION" },
    {
      name: "Custom Embed",
      value: "custom",
      placeholder: '<iframe src="..." width="100%" height="400" frameborder="0"></iframe>',
    },
  ]

  constructor(editor: any) {
    this.editor = editor
  }

  public showEmbedDialog(): void {
    // Create dialog if it doesn't exist
    if (!this.dialog) {
      this.createDialog()
    }

    if (!this.dialog) return

    // Show the dialog
    this.dialog.style.display = "block"

    // Focus the URL input
    setTimeout(() => {
      const urlInput = this.dialog?.querySelector("#media-url") as HTMLInputElement
      if (urlInput) {
        urlInput.focus()
      }
    }, 0)
  }

  private createDialog(): void {
    // Create dialog element
    this.dialog = document.createElement("div")
    this.dialog.className = "media-embed-dialog"
    this.dialog.style.position = "fixed"
    this.dialog.style.top = "50%"
    this.dialog.style.left = "50%"
    this.dialog.style.transform = "translate(-50%, -50%)"
    this.dialog.style.backgroundColor = "white"
    this.dialog.style.border = "1px solid #ddd"
    this.dialog.style.borderRadius = "4px"
    this.dialog.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)"
    this.dialog.style.padding = "20px"
    this.dialog.style.zIndex = "1050"
    this.dialog.style.minWidth = "500px"
    this.dialog.style.maxWidth = "80%"
    this.dialog.style.display = "none"

    // Create dialog content
    this.dialog.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <h3 style="margin: 0;">Embed Media</h3>
        <button id="media-embed-close" style="background: none; border: none; font-size: 16px; cursor: pointer;">✕</button>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="media-type" style="display: block; margin-bottom: 5px;">Media Type:</label>
        <select id="media-type" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          ${this.mediaTypes.map((type) => `<option value="${type.value}">${type.name}</option>`).join("")}
        </select>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="media-url" style="display: block; margin-bottom: 5px;">URL or Embed Code:</label>
        <input id="media-url" type="text" placeholder="${this.mediaTypes[0].placeholder}" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
        <p id="media-url-help" style="margin-top: 5px; font-size: 12px; color: #666;">Enter the URL of the media you want to embed.</p>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="media-width" style="display: block; margin-bottom: 5px;">Width:</label>
        <div style="display: flex; gap: 10px; align-items: center;">
          <input id="media-width" type="number" value="640" min="100" max="1200" style="width: 100px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <span>px</span>
          <label style="display: flex; align-items: center; gap: 5px; margin-left: 20px;">
            <input id="media-responsive" type="checkbox" checke  gap: 5px; margin-left: 20px;">
            <input id="media-responsive" type="checkbox" checked>
            Responsive (100% width)
          </label>
        </div>
      </div>
      
      <div style="margin-bottom: 15px;">
        <label for="media-height" style="display: block; margin-bottom: 5px;">Height:</label>
        <div style="display: flex; gap: 10px; align-items: center;">
          <input id="media-height" type="number" value="360" min="100" max="800" style="width: 100px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          <span>px</span>
        </div>
      </div>
      
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button id="media-embed-cancel" style="padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: none; cursor: pointer;">Cancel</button>
        <button id="media-embed-insert" style="padding: 8px 16px; border: none; border-radius: 4px; background-color: #1a73e8; color: white; cursor: pointer;">Insert</button>
      </div>
    `

    // Add event listeners
    const closeButton = this.dialog.querySelector("#media-embed-close")
    const cancelButton = this.dialog.querySelector("#media-embed-cancel")
    const insertButton = this.dialog.querySelector("#media-embed-insert")
    const mediaTypeSelect = this.dialog.querySelector("#media-type") as HTMLSelectElement
    const mediaUrlInput = this.dialog.querySelector("#media-url") as HTMLInputElement
    const mediaUrlHelp = this.dialog.querySelector("#media-url-help") as HTMLElement
    const responsiveCheckbox = this.dialog.querySelector("#media-responsive") as HTMLInputElement
    const widthInput = this.dialog.querySelector("#media-height") as HTMLInputElement

    if (closeButton && cancelButton) {
      closeButton.addEventListener("click", () => this.closeDialog())
      cancelButton.addEventListener("click", () => this.closeDialog())
    }

    if (insertButton) {
      insertButton.addEventListener("click", () => this.insertMedia())
    }

    if (mediaTypeSelect && mediaUrlInput && mediaUrlHelp) {
      mediaTypeSelect.addEventListener("change", () => {
        const selectedType = mediaTypeSelect.value
        const mediaType = this.mediaTypes.find((type) => type.value === selectedType)

        if (mediaType) {
          mediaUrlInput.placeholder = mediaType.placeholder

          if (mediaType.value === "custom") {
            mediaUrlHelp.textContent = "Enter the embed code directly."
          } else {
            mediaUrlHelp.textContent = "Enter the URL of the media you want to embed."
          }
        }
      })
    }

    if (responsiveCheckbox && widthInput) {
      responsiveCheckbox.addEventListener("change", () => {
        widthInput.disabled = responsiveCheckbox.checked
        if (responsiveCheckbox.checked) {
          widthInput.value = "100%"
        } else {
          widthInput.value = "640"
        }
      })
    }

    // Add to document body
    document.body.appendChild(this.dialog)
  }

  private closeDialog(): void {
    if (this.dialog) {
      this.dialog.style.display = "none"
    }
  }

  private insertMedia(): void {
    if (!this.dialog) return

    const mediaTypeSelect = this.dialog.querySelector("#media-type") as HTMLSelectElement
    const mediaUrlInput = this.dialog.querySelector("#media-url") as HTMLInputElement
    const responsiveCheckbox = this.dialog.querySelector("#media-responsive") as HTMLInputElement
    const widthInput = this.dialog.querySelector("#media-width") as HTMLInputElement
    const heightInput = this.dialog.querySelector("#media-height") as HTMLInputElement

    if (!mediaTypeSelect || !mediaUrlInput || !widthInput || !heightInput) return

    const mediaType = mediaTypeSelect.value
    const mediaUrl = mediaUrlInput.value.trim()
    const isResponsive = responsiveCheckbox.checked
    const width = isResponsive ? "100%" : `${widthInput.value}px`
    const height = `${heightInput.value}px`

    if (!mediaUrl) {
      alert("Please enter a URL or embed code.")
      return
    }

    let embedCode = ""

    if (mediaType === "custom") {
      // Use the custom embed code directly
      embedCode = mediaUrl
    } else {
      // Generate embed code based on media type
      switch (mediaType) {
        case "youtube":
          const youtubeId = this.extractYoutubeId(mediaUrl)
          if (youtubeId) {
            embedCode = `<iframe width="${width}" height="${height}" src="https://www.youtube.com/embed/${youtubeId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
          } else {
            alert("Invalid YouTube URL. Please enter a valid YouTube URL.")
            return
          }
          break

        case "vimeo":
          const vimeoId = this.extractVimeoId(mediaUrl)
          if (vimeoId) {
            embedCode = `<iframe width="${width}" height="${height}" src="https://player.vimeo.com/video/${vimeoId}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
          } else {
            alert("Invalid Vimeo URL. Please enter a valid Vimeo URL.")
            return
          }
          break

        case "twitter":
          embedCode = `<blockquote class="twitter-tweet" data-width="${width}"><a href="${mediaUrl}"></a></blockquote><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>`
          break

        case "instagram":
          embedCode = `<blockquote class="instagram-media" data-width="${width}" data-instgrm-captioned data-instgrm-permalink="${mediaUrl}"></blockquote><script async src="//www.instagram.com/embed.js"></script>`
          break

        case "soundcloud":
          embedCode = `<iframe width="${width}" height="${height}" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=${encodeURIComponent(mediaUrl)}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"></iframe>`
          break

        case "spotify":
          const spotifyId = this.extractSpotifyId(mediaUrl)
          if (spotifyId) {
            embedCode = `<iframe src="https://open.spotify.com/embed/${spotifyId}" width="${width}" height="${height}" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`
          } else {
            alert("Invalid Spotify URL. Please enter a valid Spotify URL.")
            return
          }
          break

        case "googlemaps":
          embedCode = `<iframe width="${width}" height="${height}" frameborder="0" style="border:0" src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(mediaUrl)}" allowfullscreen></iframe>`
          break

        default:
          alert("Unsupported media type.")
          return
      }
    }

    // Create a wrapper div for the embed
    const wrapperDiv = `<div class="media-embed" style="max-width: ${width}; margin: 20px auto;">${embedCode}</div>`

    // Insert the embed code
    this.editor.insertHTML(wrapperDiv)

    // Close the dialog
    this.closeDialog()
  }

  private extractYoutubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  private extractVimeoId(url: string): string | null {
    const regExp = /^.*(vimeo.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/
    const match = url.match(regExp)
    return match ? match[5] : null
  }

  private extractSpotifyId(url: string): string | null {
    const regExp = /^.*(spotify.com\/)((track|album|playlist|artist)\/)([A-Za-z0-9]+)/
    const match = url.match(regExp)
    return match ? `${match[3]}/${match[4]}` : null
  }

  public destroy(): void {
    // Remove dialog if it exists
    if (this.dialog) {
      document.body.removeChild(this.dialog)
      this.dialog = null
    }
  }
}
