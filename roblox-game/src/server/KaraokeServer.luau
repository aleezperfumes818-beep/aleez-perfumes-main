--!strict
-- Karaoke Stage & Lyrics Synchronization Server

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Config = require(ReplicatedStorage.Shared.Config)
local Network = require(ReplicatedStorage.Shared.Network)

local KaraokeServer = {}

local queue: { Player } = {}
local currentSinger: Player? = nil
local screenRefs: {
    SongLabel: TextLabel,
    SingerLabel: TextLabel,
    ActiveLyric: TextLabel,
    NextLyric: TextLabel
}? = nil

local isSingingSessionActive = false
local currentSongIndex = 1

function KaraokeServer.registerScreen(refs: any)
    screenRefs = refs
end

function KaraokeServer.init()
    local joinEvent = Network.getEvent("JoinKaraokeQueue")
    local leaveEvent = Network.getEvent("LeaveKaraokeQueue")
    local skipEvent = Network.getEvent("SkipKaraokeSinger")

    joinEvent.OnServerEvent:Connect(function(player: Player)
        KaraokeServer.joinQueue(player)
    end)

    leaveEvent.OnServerEvent:Connect(function(player: Player)
        KaraokeServer.leaveQueue(player)
    end)

    skipEvent.OnServerEvent:Connect(function(player: Player)
        if currentSinger == player or player.UserId == game.CreatorId then
            KaraokeServer.nextSinger()
        end
    end)

    Players.PlayerRemoving:Connect(function(player)
        KaraokeServer.leaveQueue(player)
        if currentSinger == player then
            KaraokeServer.nextSinger()
        end
    end)

    -- Auto-loop idle lyrics if no singer
    task.spawn(function()
        while true do
            if not currentSinger then
                KaraokeServer.displayIdleScreen()
            end
            task.wait(4)
        end
    end)
end

function KaraokeServer.joinQueue(player: Player)
    local notif = Network.getEvent("Notification")

    if table.find(queue, player) or currentSinger == player then
        notif:FireClient(player, "🎤 You are already in the Karaoke Queue!")
        return
    end

    table.insert(queue, player)
    notif:FireClient(player, "🎤 You joined the Karaoke Queue! Position: #" .. #queue)
    notif:FireAllClients("🌟 " .. player.DisplayName .. " queued up for Karaoke!")

    KaraokeServer.broadcastQueueState()

    if not currentSinger then
        KaraokeServer.nextSinger()
    end
end

function KaraokeServer.leaveQueue(player: Player)
    local idx = table.find(queue, player)
    if idx then
        table.remove(queue, idx)
        KaraokeServer.broadcastQueueState()
    end
end

function KaraokeServer.nextSinger()
    -- Clean up previous singer's mic
    if currentSinger then
        local bp = currentSinger:FindFirstChild("Backpack")
        if bp and bp:FindFirstChild("🎤 Stage Microphone") then
            bp["🎤 Stage Microphone"]:Destroy()
        end
        local char = currentSinger.Character
        if char and char:FindFirstChild("🎤 Stage Microphone") then
            char["🎤 Stage Microphone"]:Destroy()
        end
    end

    if #queue == 0 then
        currentSinger = nil
        isSingingSessionActive = false
        KaraokeServer.displayIdleScreen()
        KaraokeServer.broadcastQueueState()
        return
    end

    currentSinger = table.remove(queue, 1)
    isSingingSessionActive = true
    KaraokeServer.broadcastQueueState()

    if currentSinger and currentSinger.Character then
        local char = currentSinger.Character
        local root = char:FindFirstChild("HumanoidRootPart") :: BasePart?
        if root then
            -- Teleport singer directly to the karaoke mic on stage!
            root.CFrame = CFrame.new(32, 9, -15)
        end

        -- Give Handheld Stage Microphone Gear
        KaraokeServer.giveStageMic(currentSinger)

        -- Announce singer to everyone
        local notif = Network.getEvent("Notification")
        notif:FireAllClients("🎤 NOW SINGING: " .. currentSinger.DisplayName .. " on the Karaoke Stage! 🌟")

        -- Select a Tamil Karaoke Hit
        currentSongIndex = (currentSongIndex % #Config.Playlist) + 1
        local song = Config.Playlist[currentSongIndex]

        -- Play Global Club Music
        local changeRemote = Network.getEvent("ChangeClubMusic")
        local syncRemote = Network.getEvent("ClubMusicSync")
        syncRemote:FireAllClients({
            AssetId = song.AssetId,
            Title = "🎤 Karaoke: " .. song.Title,
            IsPlaying = true
        })

        -- Start Animated Lyric Broadcasting Loop
        task.spawn(function()
            local activeSingerAtStart = currentSinger
            for i, line in ipairs(song.Lyrics) do
                if currentSinger ~= activeSingerAtStart then break end

                local nextText = (i < #song.Lyrics and song.Lyrics[i + 1].Text) or "Finish! Applause for the singer!"
                KaraokeServer.updateScreenLyrics(song.Title, currentSinger.DisplayName, line.Text, nextText)

                -- Sync to client karaoke HUD
                local lyricSync = Network.getEvent("KaraokeLyricSync")
                lyricSync:FireAllClients({
                    SongTitle = song.Title,
                    SingerName = currentSinger.DisplayName,
                    CurrentLine = line.Text,
                    NextLine = nextText
                })

                local waitTime = (i < #song.Lyrics and (song.Lyrics[i + 1].Time - line.Time)) or 6
                task.wait(math.max(3, waitTime))
            end

            -- Song finished! Award Vibes
            if currentSinger == activeSingerAtStart then
                local LeaderstatsManager = require(script.Parent.LeaderstatsManager)
                LeaderstatsManager.addVibes(currentSinger, 20)
                notif:FireClient(currentSinger, "🎉 Great Performance! You earned +20 Vibes!")
                notif:FireAllClients("👏 Big applause for " .. currentSinger.DisplayName .. "! 🌟")

                task.wait(3)
                KaraokeServer.nextSinger()
            end
        end)
    end
end

function KaraokeServer.giveStageMic(player: Player)
    local backpack = player:FindFirstChild("Backpack")
    if not backpack then return end

    local micTool = Instance.new("Tool")
    micTool.Name = "🎤 Stage Microphone"
    micTool.ToolTip = "Sing your heart out on the island stage!"

    local handle = Instance.new("Part")
    handle.Name = "Handle"
    handle.Size = Vector3.new(0.6, 1.8, 0.6)
    handle.Material = Enum.Material.Metal
    handle.Color = Color3.fromRGB(40, 42, 50)
    handle.Parent = micTool

    local head = Instance.new("Part")
    head.Shape = Enum.PartType.Ball
    head.Size = Vector3.new(1, 1, 1)
    head.Position = handle.Position + Vector3.new(0, 0.9, 0)
    head.Material = Enum.Material.Neon
    head.Color = Color3.fromRGB(255, 220, 80)
    head.Parent = micTool

    local weld = Instance.new("WeldConstraint")
    weld.Part0 = handle
    weld.Part1 = head
    weld.Parent = handle

    micTool.Parent = backpack
end

function KaraokeServer.updateScreenLyrics(songTitle: string, singerName: string, activeText: string, nextText: string)
    if not screenRefs then return end
    screenRefs.SongLabel.Text = "🎵 " .. songTitle
    screenRefs.SingerLabel.Text = "🎤 Singer: " .. singerName
    screenRefs.ActiveLyric.Text = activeText
    screenRefs.NextLyric.Text = "Next: " .. nextText
end

function KaraokeServer.displayIdleScreen()
    if not screenRefs then return end
    screenRefs.SongLabel.Text = "🎵 Tamil Karaoke Stage Ready"
    screenRefs.SingerLabel.Text = "🎤 Step up to the Mic or click [Karaoke Queue] to sing!"
    screenRefs.ActiveLyric.Text = "Enjoy the tropical island vibes & grab a tender coconut! 🌴"
    screenRefs.NextLyric.Text = "Queue empty. Be the first singer!"
end

function KaraokeServer.broadcastQueueState()
    local names = {}
    for _, p in ipairs(queue) do
        table.insert(names, p.DisplayName)
    end

    local stateRemote = Network.getEvent("KaraokeStateSync")
    stateRemote:FireAllClients({
        Singer = currentSinger and currentSinger.DisplayName or "None",
        Queue = names
    })
end

function KaraokeServer.getCurrentSinger(): Player?
    return currentSinger
end

return KaraokeServer
