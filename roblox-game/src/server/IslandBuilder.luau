--!strict
-- Island Builder: Edit-Mode & Play-Mode Compatible Generator
-- Can be generated permanently in Edit Mode via Command Bar, or dynamically on Play (F5)

local Lighting = game:GetService("Lighting")
local Workspace = game:GetService("Workspace")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local TweenService = game:GetService("TweenService")

local Network = require(ReplicatedStorage.Shared.Network)
local Config = require(ReplicatedStorage.Shared.Config)
local ClubFX = require(script.Parent.ClubFX)
local DJManager = require(script.Parent.DJManager)

local IslandBuilder = {}

local MAP_FOLDER_NAME = "TropicalTamilIsland"

function IslandBuilder.init()
    -- Clean up any black leaderboard board blocking the path
    for _, obj in ipairs(Workspace:GetDescendants()) do
        if obj.Name == "TimePlayedThumbnailLeaderboard" or obj.Name == "LeaderboardBoard" then
            obj:Destroy()
        end
    end

    -- Hide flat default baseplate
    local baseplate = Workspace:FindFirstChild("Baseplate")
    if baseplate and baseplate:IsA("BasePart") then
        baseplate.Transparency = 1
        baseplate.CanCollide = false
    end

    local existing = Workspace:FindFirstChild(MAP_FOLDER_NAME)
    local map: Folder

    if existing and existing:IsA("Folder") then
        map = existing
        print("🌴 [IslandBuilder] Existing island detected. Attaching systems...")
    else
        map = Instance.new("Folder")
        map.Name = MAP_FOLDER_NAME
        map.Parent = Workspace

        -- Build Full 3D Island & Club Architecture
        IslandBuilder.buildIslandLandscape(map)
        IslandBuilder.buildVegetationAndProps(map)
        IslandBuilder.buildNightclub(map)
        IslandBuilder.buildKaraokeStage(map)
        IslandBuilder.buildOutdoorOceanFloor(map)
        IslandBuilder.buildBeachBar(map)
        IslandBuilder.buildBeachFireworks(map)
        IslandBuilder.buildOceanSounds(map)
        print("🌴 [IslandBuilder] Tropical Island generated successfully!")
    end

    -- Setup Tropical Atmosphere
    IslandBuilder.setupTropicalLighting()

    -- Only run runtime boundary teleports if in Play/Run mode
    if RunService:IsRunning() then
        IslandBuilder.setupOceanBoundaryEnforcement()
    end
end

function IslandBuilder.setupTropicalLighting()
    Lighting.ClockTime = 17.2
    Lighting.Brightness = 2.8
    Lighting.OutdoorAmbient = Color3.fromRGB(150, 140, 170)
    Lighting.Ambient = Color3.fromRGB(120, 115, 140)
    Lighting.ExposureCompensation = 0.4
    Lighting.GlobalShadows = true

    local bloom = Lighting:FindFirstChildOfClass("BloomEffect") or Instance.new("BloomEffect")
    bloom.Intensity = 0.7
    bloom.Size = 22
    bloom.Threshold = 0.85
    bloom.Parent = Lighting

    local cc = Lighting:FindFirstChildOfClass("ColorCorrectionEffect") or Instance.new("ColorCorrectionEffect")
    cc.TintColor = Color3.fromRGB(255, 245, 235)
    cc.Saturation = 0.25
    cc.Contrast = 0.08
    cc.Parent = Lighting
end

function IslandBuilder.buildIslandLandscape(parent: Folder)
    local ocean = Instance.new("Part")
    ocean.Name = "OceanWater"
    ocean.Size = Vector3.new(800, 2, 800)
    ocean.Position = Vector3.new(0, -1, 0)
    ocean.Anchored = true
    ocean.Material = Enum.Material.Glass
    ocean.Color = Color3.fromRGB(0, 140, 195)
    ocean.Transparency = 0.35
    ocean.Reflectance = 0.3
    ocean.CanCollide = false
    ocean.Parent = parent

    local seabed = Instance.new("Part")
    seabed.Name = "Seabed"
    seabed.Size = Vector3.new(800, 4, 800)
    seabed.Position = Vector3.new(0, -4, 0)
    seabed.Anchored = true
    seabed.Material = Enum.Material.Sand
    seabed.Color = Color3.fromRGB(160, 140, 110)
    seabed.Parent = parent

    local beach = Instance.new("Part")
    beach.Name = "SandyBeach"
    beach.Size = Vector3.new(Config.IslandSize, 3, Config.IslandSize)
    beach.Position = Vector3.new(0, 1, 0)
    beach.Anchored = true
    beach.Material = Enum.Material.Sand
    beach.Color = Color3.fromRGB(242, 218, 168)
    beach.TopSurface = Enum.SurfaceType.Smooth
    beach.Parent = parent

    local grassPlateau = Instance.new("Part")
    grassPlateau.Name = "GrassPlateau"
    grassPlateau.Size = Vector3.new(170, 2, 170)
    grassPlateau.Position = Vector3.new(0, 3, 0)
    grassPlateau.Anchored = true
    grassPlateau.Material = Enum.Material.Grass
    grassPlateau.Color = Color3.fromRGB(85, 165, 75)
    grassPlateau.TopSurface = Enum.SurfaceType.Smooth
    grassPlateau.Parent = parent

    local path = Instance.new("Part")
    path.Name = "PavedWalkway"
    path.Size = Vector3.new(18, 0.4, 55)
    path.Position = Vector3.new(0, 4.1, 45)
    path.Anchored = true
    path.Material = Enum.Material.Cobblestone
    path.Color = Color3.fromRGB(180, 175, 170)
    path.Parent = parent

    local spawn = Instance.new("SpawnLocation")
    spawn.Name = "IslandClubSpawn"
    spawn.Size = Vector3.new(10, 0.6, 10)
    spawn.CFrame = CFrame.lookAt(Vector3.new(0, 4.4, 62), Vector3.new(0, 4.4, 0))
    spawn.Anchored = true
    spawn.CanCollide = false
    spawn.Transparency = 1
    spawn.Duration = 0
    spawn.Parent = parent
end

function IslandBuilder.buildVegetationAndProps(parent: Folder)
    local propsFolder = Instance.new("Folder")
    propsFolder.Name = "IslandProps"
    propsFolder.Parent = parent

    local palmPositions = {
        Vector3.new(-85, 2.5, -85), Vector3.new(85, 2.5, -85),
        Vector3.new(-95, 2.5, 0),   Vector3.new(95, 2.5, 0),
        Vector3.new(-85, 2.5, 85),  Vector3.new(85, 2.5, 85),
        Vector3.new(-25, 4.2, 55),  Vector3.new(25, 4.2, 55),
        Vector3.new(-50, 4.2, 20),  Vector3.new(50, 4.2, 20),
        Vector3.new(-70, 2.5, -30), Vector3.new(70, 2.5, -30),
    }

    for i, pos in ipairs(palmPositions) do
        local trunk = Instance.new("Part")
        trunk.Name = "PalmTrunk_" .. i
        trunk.Size = Vector3.new(2.2, 20, 2.2)
        trunk.Position = pos + Vector3.new(0, 10, 0)
        trunk.Anchored = true
        trunk.Material = Enum.Material.Wood
        trunk.Color = Color3.fromRGB(115, 75, 45)
        trunk.Parent = propsFolder

        local leaves = Instance.new("Part")
        leaves.Name = "PalmLeaves_" .. i
        leaves.Size = Vector3.new(16, 2, 16)
        leaves.Position = pos + Vector3.new(0, 20.5, 0)
        leaves.Anchored = true
        leaves.Material = Enum.Material.Grass
        leaves.Color = Color3.fromRGB(50, 140, 50)
        leaves.Parent = propsFolder
    end

    local firePit = Instance.new("Part")
    firePit.Name = "BeachFirePit"
    firePit.Shape = Enum.PartType.Cylinder
    firePit.Size = Vector3.new(1.2, 7, 7)
    firePit.CFrame = CFrame.new(-65, 2.5, 55) * CFrame.Angles(0, 0, math.rad(90))
    firePit.Anchored = true
    firePit.Material = Enum.Material.Slate
    firePit.Color = Color3.fromRGB(60, 60, 65)
    firePit.Parent = propsFolder

    local fire = Instance.new("Fire")
    fire.Size = 6
    fire.Heat = 8
    fire.Color = Color3.fromRGB(255, 140, 40)
    fire.SecondaryColor = Color3.fromRGB(255, 60, 20)
    fire.Parent = firePit

    local fireLight = Instance.new("PointLight")
    fireLight.Color = Color3.fromRGB(255, 160, 60)
    fireLight.Brightness = 3.5
    fireLight.Range = 25
    fireLight.Parent = firePit

    local logOffsets = {
        Vector3.new(0, 0, 8),
        Vector3.new(0, 0, -8),
        Vector3.new(8, 0, 0),
        Vector3.new(-8, 0, 0)
    }
    for i, offset in ipairs(logOffsets) do
        local seat = Instance.new("Seat")
        seat.Name = "LogSeat_" .. i
        seat.Size = Vector3.new(4, 1.4, 2)
        seat.Position = Vector3.new(-65, 2.8, 55) + offset
        seat.Anchored = true
        seat.Material = Enum.Material.Wood
        seat.Color = Color3.fromRGB(90, 60, 40)
        seat.Parent = propsFolder
    end

    local torchPositions = {
        Vector3.new(-12, 4, 35), Vector3.new(12, 4, 35),
        Vector3.new(-12, 4, 55), Vector3.new(12, 4, 55),
        Vector3.new(-12, 4, 75), Vector3.new(12, 4, 75)
    }
    for _, tPos in ipairs(torchPositions) do
        local pole = Instance.new("Part")
        pole.Size = Vector3.new(0.8, 8, 0.8)
        pole.Position = tPos + Vector3.new(0, 4, 0)
        pole.Anchored = true
        pole.Material = Enum.Material.Wood
        pole.Color = Color3.fromRGB(80, 50, 30)
        pole.Parent = propsFolder

        local torchFire = Instance.new("Fire")
        torchFire.Size = 2.5
        torchFire.Heat = 5
        torchFire.Parent = pole

        local torchLight = Instance.new("PointLight")
        torchLight.Color = Color3.fromRGB(255, 170, 70)
        torchLight.Brightness = 2
        torchLight.Range = 16
        torchLight.Parent = pole
    end
end

function IslandBuilder.buildNightclub(parent: Folder)
    local clubFolder = Instance.new("Folder")
    clubFolder.Name = "TamilNightclub"
    clubFolder.Parent = parent

    local floor = Instance.new("Part")
    floor.Name = "ClubFloor"
    floor.Size = Vector3.new(100, 2, 80)
    floor.Position = Vector3.new(0, 4.2, -15)
    floor.Anchored = true
    floor.Material = Enum.Material.WoodPlanks
    floor.Color = Color3.fromRGB(140, 95, 65)
    floor.Parent = clubFolder

    local wallBack = Instance.new("Part")
    wallBack.Size = Vector3.new(100, 26, 2)
    wallBack.Position = Vector3.new(0, 17, -54)
    wallBack.Anchored = true
    wallBack.Material = Enum.Material.Slate
    wallBack.Color = Color3.fromRGB(28, 30, 40)
    wallBack.Parent = clubFolder

    local neonBack = Instance.new("Part")
    neonBack.Size = Vector3.new(98, 0.8, 0.5)
    neonBack.Position = Vector3.new(0, 17, -52.8)
    neonBack.Anchored = true
    neonBack.Material = Enum.Material.Neon
    neonBack.Color = Color3.fromRGB(0, 240, 255)
    neonBack.Parent = clubFolder

    local wallLeft = Instance.new("Part")
    wallLeft.Size = Vector3.new(2, 26, 80)
    wallLeft.Position = Vector3.new(-50, 17, -15)
    wallLeft.Anchored = true
    wallLeft.Material = Enum.Material.Slate
    wallLeft.Color = Color3.fromRGB(28, 30, 40)
    wallLeft.Parent = clubFolder

    local neonLeft = Instance.new("Part")
    neonLeft.Size = Vector3.new(0.5, 0.8, 78)
    neonLeft.Position = Vector3.new(-48.8, 17, -15)
    neonLeft.Anchored = true
    neonLeft.Material = Enum.Material.Neon
    neonLeft.Color = Color3.fromRGB(255, 40, 150)
    neonLeft.Parent = clubFolder

    local wallRight = Instance.new("Part")
    wallRight.Size = Vector3.new(2, 26, 80)
    wallRight.Position = Vector3.new(50, 17, -15)
    wallRight.Anchored = true
    wallRight.Material = Enum.Material.Slate
    wallRight.Color = Color3.fromRGB(28, 30, 40)
    wallRight.Parent = clubFolder

    local neonRight = Instance.new("Part")
    neonRight.Size = Vector3.new(0.5, 0.8, 78)
    neonRight.Position = Vector3.new(48.8, 17, -15)
    neonRight.Anchored = true
    neonRight.Material = Enum.Material.Neon
    neonRight.Color = Color3.fromRGB(160, 50, 255)
    neonRight.Parent = clubFolder

    local roof = Instance.new("Part")
    roof.Name = "ClubRoof"
    roof.Size = Vector3.new(104, 2, 84)
    roof.Position = Vector3.new(0, 30, -15)
    roof.Anchored = true
    roof.Material = Enum.Material.SmoothPlastic
    roof.Color = Color3.fromRGB(25, 27, 36)
    roof.Parent = clubFolder

    local sign = Instance.new("Part")
    sign.Name = "ClubNeonSign"
    sign.Size = Vector3.new(65, 7, 2)
    sign.Position = Vector3.new(0, 35, 25)
    sign.Anchored = true
    sign.Material = Enum.Material.SmoothPlastic
    sign.Color = Color3.fromRGB(15, 17, 24)
    sign.Parent = clubFolder

    local sGui = Instance.new("SurfaceGui")
    sGui.Face = Enum.NormalId.Back
    sGui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud
    sGui.PixelsPerStud = 50
    sGui.Parent = sign

    local label = Instance.new("TextLabel")
    label.Size = UDim2.new(1, 0, 1, 0)
    label.BackgroundTransparency = 1
    label.Font = Enum.Font.GothamBlack
    label.TextSize = 65
    label.TextColor3 = Color3.fromRGB(0, 255, 240)
    label.TextStrokeColor3 = Color3.fromRGB(255, 30, 140)
    label.TextStrokeTransparency = 0.05
    label.Text = "TAMIL ISLAND CLUB & KARAOKE"
    label.Parent = sGui

    local startX = -15
    local startZ = -22

    for x = 0, 3 do
        for z = 0, 3 do
            local tile = Instance.new("Part")
            tile.Name = "IndoorDanceTile_" .. x .. "_" .. z
            tile.Size = Vector3.new(9.2, 0.4, 9.2)
            tile.Position = Vector3.new(startX + (x * 10), 5.4, startZ + (z * 10))
            tile.Anchored = true
            tile.Material = Enum.Material.Neon
            tile.Color = Color3.fromRGB(255, 30, 140)
            tile.Parent = clubFolder

            ClubFX.registerDanceTile(tile)
        end
    end

    local djStage = Instance.new("Part")
    djStage.Size = Vector3.new(24, 3, 10)
    djStage.Position = Vector3.new(0, 6, -46)
    djStage.Anchored = true
    djStage.Material = Enum.Material.Granite
    djStage.Color = Color3.fromRGB(35, 38, 48)
    djStage.Parent = clubFolder

    local djDesk = Instance.new("Part")
    djDesk.Name = "DJConsole"
    djDesk.Size = Vector3.new(14, 3.5, 3)
    djDesk.Position = Vector3.new(0, 9, -44)
    djDesk.Anchored = true
    djDesk.Material = Enum.Material.Marble
    djDesk.Color = Color3.fromRGB(20, 22, 30)
    djDesk.Parent = clubFolder

    local djPrompt = Instance.new("ProximityPrompt")
    djPrompt.ActionText = "Take DJ Deck"
    djPrompt.ObjectText = "DJ BOOTH"
    djPrompt.HoldDuration = 0.5
    djPrompt.MaxActivationDistance = 9
    djPrompt.Parent = djDesk

    djPrompt.Triggered:Connect(function(player)
        DJManager.claimDJ(player)
    end)

    for _, xPos in ipairs({ -10, 10 }) do
        local speaker = Instance.new("Part")
        speaker.Size = Vector3.new(3.5, 9, 3.5)
        speaker.Position = Vector3.new(xPos, 11, -47)
        speaker.Anchored = true
        speaker.Material = Enum.Material.Metal
        speaker.Color = Color3.fromRGB(20, 20, 25)
        speaker.Parent = clubFolder

        local cone = Instance.new("Part")
        cone.Shape = Enum.PartType.Cylinder
        cone.Size = Vector3.new(0.5, 2.6, 2.6)
        cone.CFrame = CFrame.new(xPos, 11, -45.1) * CFrame.Angles(0, 0, math.rad(90))
        cone.Anchored = true
        cone.Material = Enum.Material.Neon
        cone.Color = Color3.fromRGB(0, 240, 255)
        cone.Parent = clubFolder
    end

    for z = -35, -5, 15 do
        local booth = Instance.new("Seat")
        booth.Name = "VIPClubSeat_" .. z
        booth.Size = Vector3.new(10, 2.2, 4)
        booth.Position = Vector3.new(-38, 6.2, z)
        booth.Anchored = true
        booth.Material = Enum.Material.Fabric
        booth.Color = Color3.fromRGB(130, 25, 70)
        booth.Parent = clubFolder
    end
end

function IslandBuilder.buildKaraokeStage(parent: Folder)
    local stageFolder = Instance.new("Folder")
    stageFolder.Name = "KaraokeArea"
    stageFolder.Parent = parent

    local kStage = Instance.new("Part")
    kStage.Name = "KaraokeStagePlatform"
    kStage.Size = Vector3.new(28, 3, 20)
    kStage.Position = Vector3.new(32, 6, -15)
    kStage.Anchored = true
    kStage.Material = Enum.Material.Granite
    kStage.Color = Color3.fromRGB(40, 35, 55)
    kStage.Parent = stageFolder

    local kBorder = Instance.new("Part")
    kBorder.Size = Vector3.new(28.4, 0.4, 20.4)
    kBorder.Position = Vector3.new(32, 7.6, -15)
    kBorder.Anchored = true
    kBorder.Material = Enum.Material.Neon
    kBorder.Color = Color3.fromRGB(255, 215, 60)
    kBorder.Parent = stageFolder

    local micStand = Instance.new("Part")
    micStand.Name = "KaraokeMicStand"
    micStand.Size = Vector3.new(0.6, 5, 0.6)
    micStand.Position = Vector3.new(32, 10, -12)
    micStand.Anchored = true
    micStand.Material = Enum.Material.Metal
    micStand.Color = Color3.fromRGB(200, 200, 210)
    micStand.Parent = stageFolder

    local micHead = Instance.new("Part")
    micHead.Shape = Enum.PartType.Ball
    micHead.Size = Vector3.new(1.2, 1.2, 1.2)
    micHead.Position = Vector3.new(32, 12.8, -12)
    micHead.Anchored = true
    micHead.Material = Enum.Material.Neon
    micHead.Color = Color3.fromRGB(255, 230, 80)
    micHead.Parent = stageFolder

    local micPrompt = Instance.new("ProximityPrompt")
    micPrompt.Name = "KaraokePrompt"
    micPrompt.ActionText = "Sing (Join Karaoke Queue)"
    micPrompt.ObjectText = "KARAOKE MIC"
    micPrompt.HoldDuration = 0.5
    micPrompt.MaxActivationDistance = 9
    micPrompt.Parent = micHead

    local KaraokeServer = require(script.Parent.KaraokeServer)
    micPrompt.Triggered:Connect(function(player)
        KaraokeServer.joinQueue(player)
    end)

    local singerSpot = Instance.new("SpotLight")
    singerSpot.Name = "SingerSpotlight"
    singerSpot.Angle = 55
    singerSpot.Brightness = 6
    singerSpot.Range = 35
    singerSpot.Face = Enum.NormalId.Bottom
    singerSpot.Color = Color3.fromRGB(255, 240, 160)
    singerSpot.Parent = micHead

    local lyricScreenPart = Instance.new("Part")
    lyricScreenPart.Name = "KaraokeLyricScreen"
    lyricScreenPart.Size = Vector3.new(26, 14, 1)
    lyricScreenPart.Position = Vector3.new(32, 20, -24.5)
    lyricScreenPart.Anchored = true
    lyricScreenPart.Material = Enum.Material.SmoothPlastic
    lyricScreenPart.Color = Color3.fromRGB(14, 16, 24)
    lyricScreenPart.Parent = stageFolder

    local screenBorder = Instance.new("Part")
    screenBorder.Size = Vector3.new(26.6, 14.6, 0.8)
    screenBorder.Position = Vector3.new(32, 20, -24.6)
    screenBorder.Anchored = true
    screenBorder.Material = Enum.Material.Neon
    screenBorder.Color = Color3.fromRGB(0, 240, 255)
    screenBorder.Parent = stageFolder

    local screenGui = Instance.new("SurfaceGui")
    screenGui.Name = "LyricsSurfaceGui"
    screenGui.Face = Enum.NormalId.Front
    screenGui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud
    screenGui.PixelsPerStud = 30
    screenGui.Parent = lyricScreenPart

    local mainFrame = Instance.new("Frame")
    mainFrame.Size = UDim2.new(1, 0, 1, 0)
    mainFrame.BackgroundColor3 = Color3.fromRGB(12, 14, 22)
    mainFrame.BorderSizePixel = 0
    mainFrame.Parent = screenGui

    local header = Instance.new("TextLabel")
    header.Name = "HeaderLabel"
    header.Size = UDim2.new(1, 0, 0, 60)
    header.BackgroundTransparency = 1
    header.Font = Enum.Font.GothamBlack
    header.TextSize = 28
    header.TextColor3 = Color3.fromRGB(255, 215, 60)
    header.Text = "🎤 TAMIL KARAOKE STAGE 🌴"
    header.Parent = mainFrame

    local songLabel = Instance.new("TextLabel")
    songLabel.Name = "SongTitleLabel"
    songLabel.Size = UDim2.new(1, -20, 0, 45)
    songLabel.Position = UDim2.new(0, 10, 0, 65)
    songLabel.BackgroundTransparency = 1
    songLabel.Font = Enum.Font.GothamBold
    songLabel.TextSize = 22
    songLabel.TextColor3 = Color3.fromRGB(0, 240, 255)
    songLabel.Text = "🎵 Song: Enjoy Enjaami (Tamil Hit)"
    songLabel.Parent = mainFrame

    local singerLabel = Instance.new("TextLabel")
    singerLabel.Name = "SingerNameLabel"
    singerLabel.Size = UDim2.new(1, -20, 0, 40)
    singerLabel.Position = UDim2.new(0, 10, 0, 115)
    singerLabel.BackgroundTransparency = 1
    singerLabel.Font = Enum.Font.GothamMedium
    singerLabel.TextSize = 18
    singerLabel.TextColor3 = Color3.fromRGB(255, 140, 200)
    singerLabel.Text = "🎤 Singer: Step up to the mic!"
    singerLabel.Parent = mainFrame

    local activeLyric = Instance.new("TextLabel")
    activeLyric.Name = "ActiveLyricLabel"
    activeLyric.Size = UDim2.new(1, -30, 0, 90)
    activeLyric.Position = UDim2.new(0, 15, 0, 175)
    activeLyric.BackgroundColor3 = Color3.fromRGB(22, 26, 38)
    activeLyric.Font = Enum.Font.GothamBlack
    activeLyric.TextSize = 26
    activeLyric.TextColor3 = Color3.fromRGB(255, 255, 255)
    activeLyric.TextWrapped = true
    activeLyric.Text = "Enjoy, enjaami... vaango vaango onnaagi! 🌴"
    activeLyric.Parent = mainFrame

    local lyricCorner = Instance.new("UICorner")
    lyricCorner.CornerRadius = UDim.new(0, 10)
    lyricCorner.Parent = activeLyric

    local lyricStroke = Instance.new("UIStroke")
    lyricStroke.Color = Color3.fromRGB(255, 215, 60)
    lyricStroke.Thickness = 2
    lyricStroke.Parent = activeLyric

    local nextLyric = Instance.new("TextLabel")
    nextLyric.Name = "NextLyricLabel"
    nextLyric.Size = UDim2.new(1, -30, 0, 40)
    nextLyric.Position = UDim2.new(0, 15, 0, 275)
    nextLyric.BackgroundTransparency = 1
    nextLyric.Font = Enum.Font.Gotham
    nextLyric.TextSize = 18
    nextLyric.TextColor3 = Color3.fromRGB(160, 175, 200)
    nextLyric.Text = "Next: Paattan pootan kaatha boomi..."
    nextLyric.Parent = mainFrame

    KaraokeServer.registerScreen({
        SongLabel = songLabel,
        SingerLabel = singerLabel,
        ActiveLyric = activeLyric,
        NextLyric = nextLyric
    })
end

function IslandBuilder.buildOutdoorOceanFloor(parent: Folder)
    local outdoorFolder = Instance.new("Folder")
    outdoorFolder.Name = "OutdoorOceanArea"
    outdoorFolder.Parent = parent

    local boardwalk = Instance.new("Part")
    boardwalk.Name = "OceanBoardwalk"
    boardwalk.Size = Vector3.new(40, 1.5, 45)
    boardwalk.Position = Vector3.new(0, 3.8, 48)
    boardwalk.Anchored = true
    boardwalk.Material = Enum.Material.WoodPlanks
    boardwalk.Color = Color3.fromRGB(150, 105, 75)
    boardwalk.Parent = outdoorFolder

    for x = 0, 2 do
        for z = 0, 2 do
            local tile = Instance.new("Part")
            tile.Name = "OutdoorDanceTile_" .. x .. "_" .. z
            tile.Size = Vector3.new(8.5, 0.4, 8.5)
            tile.Position = Vector3.new(-10 + (x * 10), 4.7, 38 + (z * 10))
            tile.Anchored = true
            tile.Material = Enum.Material.Neon
            tile.Color = Color3.fromRGB(0, 240, 255)
            tile.Parent = outdoorFolder

            ClubFX.registerDanceTile(tile)
        end
    end

    local loungerPositions = {
        Vector3.new(-55, 2.5, 20), Vector3.new(-65, 2.5, 20),
        Vector3.new(55, 2.5, 20),  Vector3.new(65, 2.5, 20),
        Vector3.new(-70, 2.5, 70), Vector3.new(70, 2.5, 70)
    }

    for i, lPos in ipairs(loungerPositions) do
        local lounger = Instance.new("Seat")
        lounger.Name = "BeachLounger_" .. i
        lounger.Size = Vector3.new(3, 1.2, 6)
        lounger.Position = lPos
        lounger.Anchored = true
        lounger.Material = Enum.Material.WoodPlanks
        lounger.Color = Color3.fromRGB(220, 220, 225)
        lounger.Parent = outdoorFolder

        local umbrellaPole = Instance.new("Part")
        umbrellaPole.Size = Vector3.new(0.6, 9, 0.6)
        umbrellaPole.Position = lPos + Vector3.new(3, 4.5, 0)
        umbrellaPole.Anchored = true
        umbrellaPole.Material = Enum.Material.Wood
        umbrellaPole.Color = Color3.fromRGB(140, 100, 70)
        umbrellaPole.Parent = outdoorFolder

        local umbrellaTop = Instance.new("Part")
        umbrellaTop.Shape = Enum.PartType.Cylinder
        umbrellaTop.Size = Vector3.new(0.6, 8, 8)
        umbrellaTop.CFrame = CFrame.new(lPos + Vector3.new(3, 8.8, 0)) * CFrame.Angles(0, 0, math.rad(90))
        umbrellaTop.Anchored = true
        umbrellaTop.Material = Enum.Material.Fabric
        umbrellaTop.Color = (i % 2 == 0 and Color3.fromRGB(255, 70, 80)) or Color3.fromRGB(255, 200, 40)
        umbrellaTop.Parent = outdoorFolder
    end
end

function IslandBuilder.buildBeachBar(parent: Folder)
    local barFolder = Instance.new("Folder")
    barFolder.Name = "IslandBeachBar"
    barFolder.Parent = parent

    local barCounter = Instance.new("Part")
    barCounter.Name = "BeachBarCounter"
    barCounter.Size = Vector3.new(20, 4.2, 5)
    barCounter.Position = Vector3.new(-38, 5.2, 25)
    barCounter.Anchored = true
    barCounter.Material = Enum.Material.Wood
    barCounter.Color = Color3.fromRGB(115, 80, 50)
    barCounter.Parent = barFolder

    local barTop = Instance.new("Part")
    barTop.Size = Vector3.new(22, 0.5, 6)
    barTop.Position = Vector3.new(-38, 7.5, 25)
    barTop.Anchored = true
    barTop.Material = Enum.Material.Marble
    barTop.Color = Color3.fromRGB(235, 235, 240)
    barTop.Parent = barFolder

    local tap = Instance.new("Part")
    tap.Name = "CoconutTap"
    tap.Size = Vector3.new(2, 3, 2)
    tap.Position = Vector3.new(-38, 9, 25)
    tap.Anchored = true
    tap.Material = Enum.Material.Neon
    tap.Color = Color3.fromRGB(80, 210, 100)
    tap.Parent = barFolder

    local barPrompt = Instance.new("ProximityPrompt")
    barPrompt.ActionText = "Grab Drink"
    barPrompt.ObjectText = "FRESH TENDER COCONUT 🥥"
    barPrompt.HoldDuration = 0.4
    barPrompt.MaxActivationDistance = 9
    barPrompt.Parent = tap

    barPrompt.Triggered:Connect(function(player)
        IslandBuilder.giveCoconutDrink(player)
    end)
end

function IslandBuilder.giveCoconutDrink(player: Player)
    local backpack = player:FindFirstChild("Backpack")
    if not backpack then return end

    if backpack:FindFirstChild("Fresh Tender Coconut 🥥") then
        local notif = Network.getEvent("Notification")
        notif:FireClient(player, "🥥 You already have a Tender Coconut!")
        return
    end

    local tool = Instance.new("Tool")
    tool.Name = "Fresh Tender Coconut 🥥"
    tool.ToolTip = "Drink sweet tropical tender coconut"

    local handle = Instance.new("Part")
    handle.Name = "Handle"
    handle.Shape = Enum.PartType.Ball
    handle.Size = Vector3.new(1.4, 1.4, 1.4)
    handle.Material = Enum.Material.Wood
    handle.Color = Color3.fromRGB(90, 160, 70)
    handle.Parent = tool

    local straw = Instance.new("Part")
    straw.Size = Vector3.new(0.2, 1.2, 0.2)
    straw.Position = handle.Position + Vector3.new(0, 0.8, 0)
    straw.Material = Enum.Material.Neon
    straw.Color = Color3.fromRGB(255, 60, 60)
    straw.Parent = tool

    local weld = Instance.new("WeldConstraint")
    weld.Part0 = handle
    weld.Part1 = straw
    weld.Parent = handle

    local sipSound = Instance.new("Sound")
    sipSound.SoundId = "rbxassetid://9114223170"
    sipSound.Volume = 0.9
    sipSound.Parent = handle

    tool.Activated:Connect(function()
        sipSound:Play()
        local notif = Network.getEvent("Notification")
        notif:FireClient(player, "🥥 Refreshing! Drank sweet tender coconut (+12 Vibes)")

        local leaderstats = player:FindFirstChild("leaderstats")
        if leaderstats then
            local vibes = leaderstats:FindFirstChild("Vibes") :: IntValue?
            if vibes then vibes.Value += 12 end
        end
    end)

    tool.Parent = backpack

    local notif = Network.getEvent("Notification")
    notif:FireClient(player, "🥥 Tender Coconut ready! Click to drink & gain +12 Vibes!")
end

function IslandBuilder.buildBeachFireworks(parent: Folder)
    local fireworksFolder = Instance.new("Folder")
    fireworksFolder.Name = "BeachFireworks"
    fireworksFolder.Parent = parent

    local launcher = Instance.new("Part")
    launcher.Name = "FireworkLauncherConsole"
    launcher.Size = Vector3.new(4, 3.5, 4)
    launcher.Position = Vector3.new(18, 5.2, 50)
    launcher.Anchored = true
    launcher.Material = Enum.Material.Metal
    launcher.Color = Color3.fromRGB(40, 42, 55)
    launcher.Parent = fireworksFolder

    local launchButton = Instance.new("Part")
    launchButton.Shape = Enum.PartType.Cylinder
    launchButton.Size = Vector3.new(0.6, 2, 2)
    launchButton.CFrame = CFrame.new(18, 7.1, 50) * CFrame.Angles(0, 0, math.rad(90))
    launchButton.Anchored = true
    launchButton.Material = Enum.Material.Neon
    launchButton.Color = Color3.fromRGB(255, 40, 60)
    launchButton.Parent = fireworksFolder

    local launchPrompt = Instance.new("ProximityPrompt")
    launchPrompt.ActionText = "Launch Sky Fireworks 🎆"
    launchPrompt.ObjectText = "ISLAND FIREWORKS"
    launchPrompt.HoldDuration = 0.5
    launchPrompt.MaxActivationDistance = 9
    launchPrompt.Parent = launchButton

    launchPrompt.Triggered:Connect(function(player)
        IslandBuilder.triggerFireworksShow(player)
    end)

    local sparklerCrate = Instance.new("Part")
    sparklerCrate.Name = "SparklerCrate"
    sparklerCrate.Size = Vector3.new(3, 2.5, 3)
    sparklerCrate.Position = Vector3.new(-55, 2.5, 55)
    sparklerCrate.Anchored = true
    sparklerCrate.Material = Enum.Material.WoodPlanks
    sparklerCrate.Color = Color3.fromRGB(150, 100, 60)
    sparklerCrate.Parent = fireworksFolder

    local sparklerPrompt = Instance.new("ProximityPrompt")
    sparklerPrompt.ActionText = "Grab Beach Sparkler 🎇"
    sparklerPrompt.ObjectText = "SPARKLER CRATE"
    sparklerPrompt.HoldDuration = 0.4
    sparklerPrompt.MaxActivationDistance = 9
    sparklerPrompt.Parent = sparklerCrate

    sparklerPrompt.Triggered:Connect(function(player)
        IslandBuilder.giveSparklerTool(player)
    end)
end

function IslandBuilder.giveSparklerTool(player: Player)
    local backpack = player:FindFirstChild("Backpack")
    if not backpack then return end

    if backpack:FindFirstChild("🎇 Beach Sparkler") then
        local notif = Network.getEvent("Notification")
        notif:FireClient(player, "🎇 You already have a Sparkler in hand!")
        return
    end

    local tool = Instance.new("Tool")
    tool.Name = "🎇 Beach Sparkler"
    tool.ToolTip = "Hold and wave to shine colorful sparkler lights!"

    local handle = Instance.new("Part")
    handle.Name = "Handle"
    handle.Size = Vector3.new(0.3, 2.2, 0.3)
    handle.Material = Enum.Material.Metal
    handle.Color = Color3.fromRGB(180, 180, 190)
    handle.Parent = tool

    local sparklerTip = Instance.new("Part")
    sparklerTip.Shape = Enum.PartType.Ball
    sparklerTip.Size = Vector3.new(0.6, 0.6, 0.6)
    sparklerTip.Position = handle.Position + Vector3.new(0, 1.2, 0)
    sparklerTip.Material = Enum.Material.Neon
    sparklerTip.Color = Color3.fromRGB(255, 220, 80)
    sparklerTip.Parent = tool

    local weld = Instance.new("WeldConstraint")
    weld.Part0 = handle
    weld.Part1 = sparklerTip
    weld.Parent = handle

    local emitter = Instance.new("ParticleEmitter")
    emitter.Rate = 50
    emitter.Speed = NumberRange.new(5, 10)
    emitter.Lifetime = NumberRange.new(0.3, 0.6)
    emitter.Size = NumberSequence.new(0.3, 0.05)
    emitter.Color = ColorSequence.new({
        ColorSequenceKeypoint.new(0, Color3.fromRGB(255, 230, 100)),
        ColorSequenceKeypoint.new(1, Color3.fromRGB(255, 80, 160))
    })
    emitter.SpreadAngle = Vector2.new(180, 180)
    emitter.Enabled = false
    emitter.Parent = sparklerTip

    tool.Equipped:Connect(function()
        emitter.Enabled = true
    end)
    tool.Unequipped:Connect(function()
        emitter.Enabled = false
    end)

    tool.Parent = backpack

    local notif = Network.getEvent("Notification")
    notif:FireClient(player, "🎇 Grabbed a Beach Sparkler! Equip it to sparkle on the dance floor!")
end

function IslandBuilder.triggerFireworksShow(player: Player)
    local notif = Network.getEvent("Notification")
    notif:FireAllClients("🎆 " .. player.DisplayName .. " LAUNCHED THE ISLAND FIREWORKS SHOW! 🌴✨")

    task.spawn(function()
        local colors = {
            Color3.fromRGB(255, 40, 100),
            Color3.fromRGB(0, 240, 255),
            Color3.fromRGB(255, 215, 40),
            Color3.fromRGB(160, 50, 255),
            Color3.fromRGB(0, 255, 130)
        }

        for i = 1, 5 do
            task.spawn(function()
                local rocket = Instance.new("Part")
                rocket.Shape = Enum.PartType.Ball
                rocket.Size = Vector3.new(2, 2, 2)
                rocket.Position = Vector3.new(math.random(-30, 30), 8, math.random(30, 70))
                rocket.Anchored = true
                rocket.CanCollide = false
                rocket.Material = Enum.Material.Neon
                rocket.Color = colors[i]
                rocket.Parent = Workspace

                local tween = TweenService:Create(rocket, TweenInfo.new(1.2, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
                    Position = rocket.Position + Vector3.new(0, 85, 0)
                })
                tween:Play()
                tween.Completed:Wait()

                local burst = Instance.new("ParticleEmitter")
                burst.Rate = 200
                burst.Speed = NumberRange.new(20, 40)
                burst.Lifetime = NumberRange.new(1.0, 1.8)
                burst.Size = NumberSequence.new(1.2, 0)
                burst.Color = ColorSequence.new(colors[i])
                burst.SpreadAngle = Vector2.new(180, 180)
                burst.Parent = rocket

                burst:Emit(80)
                task.wait(1.8)
                rocket:Destroy()
            end)
            task.wait(0.7)
        end
    end)
end

function IslandBuilder.buildOceanSounds(parent: Folder)
    local soundPart = Instance.new("Part")
    soundPart.Name = "OceanAmbientSoundPart"
    soundPart.Size = Vector3.new(10, 10, 10)
    soundPart.Position = Vector3.new(0, 2, 80)
    soundPart.Anchored = true
    soundPart.Transparency = 1
    soundPart.CanCollide = false
    soundPart.Parent = parent

    local surfSound = Instance.new("Sound")
    surfSound.Name = "OceanSurfAmbience"
    surfSound.SoundId = "rbxassetid://9114223170"
    surfSound.Volume = 0.35
    surfSound.Looped = true
    surfSound.RollOffMaxDistance = 180
    surfSound.RollOffMinDistance = 20
    surfSound.Parent = soundPart
    surfSound:Play()
end

function IslandBuilder.setupOceanBoundaryEnforcement()
    task.spawn(function()
        while true do
            task.wait(1)
            for _, player in ipairs(Players:GetPlayers()) do
                local char = player.Character
                local root = char and char:FindFirstChild("HumanoidRootPart") :: BasePart?
                if root then
                    local distanceFromCenter = math.sqrt(root.Position.X^2 + root.Position.Z^2)
                    local isTooFar = distanceFromCenter > Config.OceanBoundaryDistance
                    local isUndersea = root.Position.Y < -8

                    if isTooFar or isUndersea then
                        root.CFrame = CFrame.new(0, 6, 60)
                        root.AssemblyLinearVelocity = Vector3.zero

                        local notif = Network.getEvent("Notification")
                        notif:FireClient(player, "🌊 The gentle ocean waves carried you safely back to the beach!")
                    end
                end
            end
        end
    end)
end

return IslandBuilder
